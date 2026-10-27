<p align="center">
  <img src="assets/logo.png" alt="App Volume Control logo" width="160">
</p>

# App Volume Control

A GNOME Shell extension for controlling the volume of individual applications from the top-panel system menu.

![GNOME Shell](https://img.shields.io/badge/GNOME%20Shell-50-4a86cf?logo=gnome&logoColor=white)
![License](https://img.shields.io/badge/license-GPL--3.0--or--later-blue)

## Preview

![App Volume Control preview](assets/preview.png)

## Installation

### From the GNOME Extensions website (Recommended)

<a href="https://extensions.gnome.org/extension/11472/app-volume-control/">
  <img src="assets/get-it-on-ego.svg" alt="Get it on GNOME Extensions" height="100">
</a>

### Manual installation

1. Clone the repository:

   ```bash
   git clone https://github.com/aunchagaonkar/gnome-app-volume-control.git
   cd gnome-app-volume-control
   ```

2. Create the local GNOME Shell extensions directory if it does not already exist:

   ```bash
   mkdir -p ~/.local/share/gnome-shell/extensions/app-volume-control@aunchagaonkar.github.io
   ```

3. Copy the extension files into the directory:

   ```bash
   cp extension.js metadata.json stylesheet.css \
     ~/.local/share/gnome-shell/extensions/app-volume-control@aunchagaonkar.github.io/
   ```

4. Enable the extension:

   ```bash
   gnome-extensions enable app-volume-control@aunchagaonkar.github.io
   ```

You may need to log out and back in, before the extension appears in the top panel.

## Contributing

Contributions, bug reports, and feature requests are welcome. When opening an issue, please include:

- GNOME Shell version
- Distribution and version
- Audio backend, if known (PipeWire or PulseAudio)
- Steps to reproduce the issue
- Relevant GNOME Shell log output

## License

[GNU GPL, version 3 or later](LICENSE).

## Support the project

If this extension is useful to you, consider supporting its development through [GitHub Sponsors](https://github.com/sponsors/aunchagaonkar) or [PayPal](https://www.paypal.com/paypalme/aunchagaonkar).
