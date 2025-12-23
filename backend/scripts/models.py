import torch
import torch.nn as nn
import torch.nn.functional as F
import matplotlib.pyplot as plt
import pytorch_lightning as pl
from pathlib import Path


class Discriminator(nn.Module):
    def __init__(self, channels=1, image_size=28):
        super().__init__()
        self.channels = channels
        self.image_size = image_size

        if image_size == 64:
            # Stronger discriminator for 64x64 images
            # No batch norm on first layer (common practice)
            self.conv1 = nn.Conv2d(channels, 64, kernel_size=4, stride=2, padding=1)  # 64->32
            self.conv2 = nn.Conv2d(64, 128, kernel_size=4, stride=2, padding=1)  # 32->16
            self.bn2 = nn.BatchNorm2d(128)
            self.conv3 = nn.Conv2d(128, 256, kernel_size=4, stride=2, padding=1)  # 16->8
            self.bn3 = nn.BatchNorm2d(256)
            self.conv4 = nn.Conv2d(256, 512, kernel_size=4, stride=2, padding=1)  # 8->4
            self.bn4 = nn.BatchNorm2d(512)
            self.fc = nn.Linear(4 * 4 * 512, 1)
        else:  # 28x28
            # Calculate flattened size after conv layers
            flattened_size = 4 * 4 * 20
            self.conv1 = nn.Conv2d(channels, 10, kernel_size=5)
            self.conv2 = nn.Conv2d(10, 20, kernel_size=5)
            self.conv2_drop = nn.Dropout2d()
            self.fc1 = nn.Linear(flattened_size, 50)
            self.fc2 = nn.Linear(50, 1)

    def forward(self, x):
        if self.image_size == 64:
            x = F.leaky_relu(self.conv1(x), 0.2)  # 32x32 (no batch norm on first layer)
            x = F.leaky_relu(self.bn2(self.conv2(x)), 0.2)  # 16x16
            x = F.leaky_relu(self.bn3(self.conv3(x)), 0.2)  # 8x8
            x = F.leaky_relu(self.bn4(self.conv4(x)), 0.2)  # 4x4
            x = x.view(x.size(0), -1)
            x = self.fc(x)
        else:  # 28x28
            x = F.relu(F.max_pool2d(self.conv1(x), 2))
            x = F.relu(F.max_pool2d(self.conv2_drop(self.conv2(x)), 2))
            x = x.view(x.size(0), -1)
            x = F.relu(self.fc1(x))
            x = F.dropout(x, training=self.training)
            x = self.fc2(x)

        return torch.sigmoid(x)


# Generate Fake Data: output like real data
class Generator(nn.Module):
    def __init__(self, latent_dim, channels=1, image_size=28):
        super().__init__()
        self.image_size = image_size

        if image_size == 64:
            # For 64x64: start with 4x4, upsample to 8x8, 16x16, 32x32, 64x64
            self.lin1 = nn.Linear(latent_dim, 4 * 4 * 512)
            self.ct1 = nn.ConvTranspose2d(512, 256, 4, stride=2, padding=1)  # 4->8
            self.bn1 = nn.BatchNorm2d(256)
            self.ct2 = nn.ConvTranspose2d(256, 128, 4, stride=2, padding=1)  # 8->16
            self.bn2 = nn.BatchNorm2d(128)
            self.ct3 = nn.ConvTranspose2d(128, 64, 4, stride=2, padding=1)  # 16->32
            self.bn3 = nn.BatchNorm2d(64)
            self.ct4 = nn.ConvTranspose2d(64, 32, 4, stride=2, padding=1)  # 32->64
            self.bn4 = nn.BatchNorm2d(32)
            self.conv = nn.Conv2d(32, channels, kernel_size=3, padding=1)  # 64->64
        else:  # 28x28
            self.lin1 = nn.Linear(latent_dim, 7 * 7 * 64)
            self.ct1 = nn.ConvTranspose2d(64, 32, 4, stride=2)  # 7->14
            self.ct2 = nn.ConvTranspose2d(32, 16, 4, stride=2)  # 14->28
            self.ct3 = None
            self.ct4 = None
            self.conv = nn.Conv2d(16, channels, kernel_size=7)  # 28->28

    def forward(self, x):
        # Pass latent space input into linear layer and reshape
        x = self.lin1(x)
        x = F.relu(x)

        if self.image_size == 64:
            x = x.view(-1, 512, 4, 4)
            x = F.relu(self.bn1(self.ct1(x)))  # 8x8
            x = F.relu(self.bn2(self.ct2(x)))  # 16x16
            x = F.relu(self.bn3(self.ct3(x)))  # 32x32
            x = F.relu(self.bn4(self.ct4(x)))  # 64x64
            x = torch.tanh(self.conv(x))  # Output in [-1, 1] range
        else:  # 28x28
            x = x.view(-1, 64, 7, 7)
            x = F.relu(self.ct1(x))  # 14x14
            x = F.relu(self.ct2(x))  # 28x28
            x = torch.tanh(self.conv(x))  # Output in [-1, 1] range

        return x


class GAN(pl.LightningModule):
    def __init__(self, latent_dim=100, channels=1, image_size=28, lr=0.0002, label_smooth=0.1):
        super().__init__()
        self.save_hyperparameters()

        # Required for multiple optimizers
        self.automatic_optimization = False

        self.generator = Generator(latent_dim=latent_dim, channels=channels, image_size=image_size)
        self.discriminator = Discriminator(channels=channels, image_size=image_size)

        self.validation_z = torch.randn(8, self.hparams.latent_dim)
        self.total_epochs_trained = 0

        # Initialize weights
        self._initialize_weights()

    def _initialize_weights(self):
        """Initialize weights for better training stability"""
        for m in self.modules():
            if isinstance(m, (nn.Conv2d, nn.ConvTranspose2d, nn.Linear)):
                nn.init.normal_(m.weight, 0.0, 0.02)
                if m.bias is not None:
                    nn.init.constant_(m.bias, 0)

    def forward(self, z):
        return self.generator(z)

    def adversarial_loss(self, y_hat, y):
        return F.binary_cross_entropy(y_hat, y)

    def training_step(self, batch, batch_idx):
        opt_g, opt_d = self.optimizers()

        real_imgs, _ = batch
        batch_size = real_imgs.size(0)

        # Sample noise for generator
        z = torch.randn(batch_size, self.hparams.latent_dim)
        z = z.type_as(real_imgs)

        # Train Discriminator - but only if it's not too strong
        # Skip discriminator training if it's winning too easily (d_loss too low)
        opt_d.zero_grad()

        # Real images
        y_hat_real = self.discriminator(real_imgs)
        # Label smoothing: use 0.9 instead of 1.0 for real labels
        y_real = torch.ones(batch_size, 1) * (1.0 - self.hparams.label_smooth)
        y_real = y_real.type_as(real_imgs)
        real_loss = self.adversarial_loss(y_hat_real, y_real)

        # Fake images
        fake_imgs = self(z).detach()  # Detach to avoid training generator here
        y_hat_fake = self.discriminator(fake_imgs)
        # Add label smoothing to fake labels too (0.1 instead of 0.0)
        y_fake = torch.zeros(batch_size, 1) + self.hparams.label_smooth
        y_fake = y_fake.type_as(real_imgs)
        fake_loss = self.adversarial_loss(y_hat_fake, y_fake)

        d_loss = (real_loss + fake_loss) / 2

        # Only train discriminator if it's not too strong (d_loss < 0.6)
        # This prevents discriminator from becoming too powerful
        if d_loss.item() < 0.6:
            # Discriminator is winning too easily, skip its training this step
            pass
        else:
            self.manual_backward(d_loss)
            opt_d.step()

        # Train Generator - always train, sometimes twice if discriminator is too strong
        opt_g.zero_grad()
        # Generate new fake images
        fake_imgs = self(z)
        y_hat = self.discriminator(fake_imgs)
        # Generator wants discriminator to think these are real
        y = torch.ones(batch_size, 1)
        y = y.type_as(real_imgs)
        g_loss = self.adversarial_loss(y_hat, y)

        self.manual_backward(g_loss)
        opt_g.step()

        # If discriminator is too strong, train generator again
        if d_loss.item() < 0.4:
            opt_g.zero_grad()
            z2 = torch.randn(batch_size, self.hparams.latent_dim)
            z2 = z2.type_as(real_imgs)
            fake_imgs2 = self(z2)
            y_hat2 = self.discriminator(fake_imgs2)
            y2 = torch.ones(batch_size, 1)
            y2 = y2.type_as(real_imgs)
            g_loss2 = self.adversarial_loss(y_hat2, y2)
            self.manual_backward(g_loss2)
            opt_g.step()
            g_loss = (g_loss + g_loss2) / 2

        # Log metrics using self.log() for ModelCheckpoint to monitor
        self.log("g_loss", g_loss, prog_bar=True)
        self.log("d_loss", d_loss, prog_bar=True)
        self.log("total_loss", g_loss + d_loss)

        return {"loss": g_loss + d_loss}

    def configure_optimizers(self):
        # Give generator higher learning rate to help it catch up
        lr_g = self.hparams.lr * 2.0  # 0.0004 - generator needs more help
        lr_d = self.hparams.lr * 0.5  # 0.0001 - slower discriminator
        opt_g = torch.optim.Adam(self.generator.parameters(), lr=lr_g, betas=(0.5, 0.999))
        opt_d = torch.optim.Adam(self.discriminator.parameters(), lr=lr_d, betas=(0.5, 0.999))
        return [opt_g, opt_d], []

    def on_train_epoch_end(self):
        e = self.total_epochs_trained
        is_power_of_2 = e > 0 and (e & (e - 1)) == 0
        show = (e < 200 and is_power_of_2) or e % 200 == 0
        self.plot_imgs(show=show)
        self.total_epochs_trained += 1

    def plot_imgs(self, show=True):
        if not show:
            return

        z = self.validation_z.type_as(self.generator.lin1.weight)
        sample_imgs = self(z).cpu()

        # Denormalize from [-1, 1] to [0, 1] for display
        sample_imgs = (sample_imgs + 1) / 2.0
        sample_imgs = torch.clamp(sample_imgs, 0, 1)

        fig = plt.figure(facecolor="black")
        fig.patch.set_facecolor("black")
        image_size = self.hparams.image_size
        channels = self.hparams.channels

        for i in range(sample_imgs.shape[0]):
            ax = plt.subplot(2, 4, i + 1)
            ax.set_facecolor("black")
            plt.tight_layout()

            if channels == 1:
                # Grayscale image
                plt.imshow(
                    sample_imgs.detach()[i, 0, :, :].reshape(image_size, image_size),
                    cmap="gray",
                    interpolation="none",
                )
            else:
                # RGB image - transpose from CHW to HWC
                img = sample_imgs.detach()[i].permute(1, 2, 0).numpy()
                plt.imshow(img, interpolation="none")

            plt.title("Epoch {}".format(self.total_epochs_trained), color="white")
            plt.xticks([])
            plt.yticks([])
            plt.axis("off")

        plt.show()
        plt.close(fig)


def load_gan_model(DEVICE: torch.device) -> GAN:
    """Load the GAN model from a .ckpt file."""
    model_path = Path(__file__).parent.parent / "models" / "gan_flowers_final.ckpt"
    model = GAN.load_from_checkpoint(str(model_path), channels=3, image_size=64)
    model.eval()
    model.to(DEVICE)
    print(f"Model loaded successfully on {DEVICE}")
    return model
