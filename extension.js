import St from "gi://St";

import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";
import Gvc from "gi://Gvc";
import Clutter from "gi://Clutter";
import * as Slider from "resource:///org/gnome/shell/ui/slider.js";

export default class AppVolumeControlExtension extends Extension {
  enable() {
    this._indicator = new PanelMenu.Button(0.0, this.metadata.name, false);

    const icon = new St.Icon({
      icon_name: "audio-volume-high-symbolic",
      style_class: "system-status-icon",
    });

    this._indicator.add_child(icon);

    this._streamItems = [];
    this._streamSignalHandlers = [];

    Main.panel.addToStatusArea(this.uuid, this._indicator);

    this._mixerControl = new Gvc.MixerControl({
      name: "App Volume Control",
    });

    this._mixerControl.open();

    this._streamAddedId = this._mixerControl.connect(
      "stream-added",
      (_control, streamId) => {
        const stream = this._mixerControl.lookup_stream_id(streamId);

        if (!stream) {
          console.debug(`Could not find stream: ${streamId}`);
          return;
        }

        this._rebuildMenu();
      },
    );

    this._streamRemovedId = this._mixerControl.connect(
      "stream-removed",
      (_control, _streamId) => this._rebuildMenu()
    );

    this._streamChangedId = this._mixerControl.connect(
      "stream-changed",
      (_control, _streamId) => this._rebuildMenu()
    );

    this._stateChangedId = this._mixerControl.connect(
      "state-changed",
      (_control, _state) => this._rebuildMenu()
    );

  }

  _disconnectStreamSignals() {
    for (const { stream, volumeId, mutedId } of this._streamSignalHandlers) {
      if (volumeId) {
        stream.disconnect(volumeId);
      }
      if (mutedId) {
        stream.disconnect(mutedId);
      }
    )

    console.log("App Volume Control: enabled");
  }

  _logPlaybackStream() {
    const streams = this._mixerControl.get_sink_inputs();
    console.log(`Playback stream count: ${streams.length}`);
    for (const stream of streams) {
      console.log(`Playback app: ${stream.name}, `);
    }
    this._streamSignalHandlers = [];
  }
  _rebuildMenu() {
    this._disconnectStreamSignals();

    for (const item of this._streamItems) {
      item.destroy();
    }
    this._streamItems = [];

    const streams = this._mixerControl.get_sink_inputs();

    if (streams.length === 0) {
      const emptyItem = new PopupMenu.PopupMenuItem(
        "No applications playing audio",
        { reactive: false },
      );
      this._indicator.menu.addMenuItem(emptyItem);
      this._streamItems.push(emptyItem);
      return;
    }

    for (const stream of streams) {
      const baseVolume = this._mixerControl.get_vol_max_norm();

      const percent = Math.round((stream.volume * 100) / baseVolume);
      console.log(
        `${stream.name}: volume=${stream.volume}, normal=${baseVolume}, muted=${stream.is_muted}`,
      );
      const item = new PopupMenu.PopupBaseMenuItem({ reactive: false });
      const label = new St.Label({
        text: `${stream.name}: ${percent}%`,
        y_align: Clutter.ActorAlign.CENTER,
        style_class: "app-volume-label"
      });
      const slider = new Slider.Slider(percent / 100);
      const muteIcon = new St.Icon({
        icon_name: stream.is_muted
          ? "audio-volume-muted-symbolic" : "audio-volume-high-symbolic",
        style_class: "popup-menu-icon",
      });

      const muteButton = new St.Button({
        style_class: "app-volume-mute-icon",
        can_focus: true,
        child: muteIcon,
      });

      slider.connect("notify::value", () => {
        const newVolume = Math.round(slider.value * baseVolume);
        const newPercent = Math.round(slider.value * 100);
        console.log(
          `${stream.name}: slider_value=${slider.value} newVolume=${newVolume}`,
        )
        label.text = `${stream.name}: ${newPercent}%`;
        stream.set_volume(newVolume);
        stream.push_volume();
      });

      muteButton.connect("clicked", () => {
        const shouldMute = !stream.is_muted;
        stream.change_is_muted(shouldMute);
        muteIcon.icon_name = shouldMute ? "audio-volume-muted-symbolic" : "audio-volume-high-symbolic";
      });

      const volumeId = stream.connect("notify::volume", () => {
        const updatedPercent = Math.round(
          (stream.volume * 100) / baseVolume
        )
        label.text = `${stream.name}: ${updatedPercent}%`;
        const updatedValue = stream.volume / baseVolume;
        if (slider.value !== updatedValue) {
          slider.value = updatedValue;
        }
      });

      const mutedId = stream.connect("notify::is-muted", () => {
        muteIcon.icon_name = stream.is_muted
          ? "audio-volume-muted-symbolic" : "audio-volume-high-symbolic"
      });

      slider.x_expand = true;
      slider.style = "min-width: 140px";

      item.add_child(label);
      item.add_child(muteButton);
      item.add_child(slider);

      this._indicator.menu.addMenuItem(item);
      this._streamItems.push(item);

      this._streamSignalHandlers.push({
        stream,
        volumeId,
        mutedId
      })
    }
  }
  disable() {
    this._disconnectStreamSignals();

    for (const item of this._streamItems) {
      item.destroy();
    }
    this._streamItems = [];

    if (this._streamAddedId) {
      this._mixerControl.disconnect(this._streamAddedId);
      this._streamAddedId = null;
    }

    if (this._streamRemovedId) {
      this._mixerControl.disconnect(this._streamRemovedId);
      this._streamRemovedId = null;
    }

    if (this._streamChangedId) {
      this._mixerControl.disconnect(this._streamChangedId);
      this._streamChangedId = null;
    }
    if (this._stateChangedId) {
      this._mixerControl.disconnect(this._stateChangedId);
      this._stateChangedId = null;
    }

    this._mixerControl?.close();
    this._mixerControl = null;

    this._indicator?.destroy();
    this._indicator = null;

    console.log("App Volume Control: disabled");
  }
}
