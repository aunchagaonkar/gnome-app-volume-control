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
    // add a icon to the panel
    this._indicator = new PanelMenu.Button(0.0, this.metadata.name, false);
    const icon = new St.Icon({
      icon_name: "audio-volume-high-symbolic",
      style_class: "system-status-icon",
    });
    this._indicator.add_child(icon);

    // add a popup menu item
    this._streamItems = [];

    Main.panel.addToStatusArea(this.uuid, this._indicator);

    // monitor newly added audio streams
    this._mixerControl = new Gvc.MixerControl({
      name: "App Volume Control",
    });

    this._mixerControl.open();
    console.log("Gvc mixer opened");

    // add a callback for stream-added signal
    this._streamAddedId = this._mixerControl.connect(
      "stream-added",
      (control, streamId) => {
        const stream = this._mixerControl.lookup_stream_id(streamId);

        if (!stream) {
          console.log(`Could not find stream: ${streamId}`);
          return;
        }

        console.log(`Audio stream added: ${streamId}, name: ${stream.name}`);
        this._logPlaybackStream();
        this._rebuildMenu();
      },
    );

    this._streamRemovedId = this._mixerControl.connect(
      "stream-removed",
      (control, streamId) => {
        console.log(`Audio stream removed: ${streamId}`);
        this._rebuildMenu();
      }
    )

    this._stateChangedId = this._mixerControl.connect(
      "state-changed",
      (control, streamId) => {
        console.log(`Audio stream state changed: ${streamId}`);
        this._rebuildMenu();
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
  }

  _rebuildMenu() {
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
        text: `${stream.name}: ${percent}`,
        y_align: Clutter.ActorAlign.CENTER,
      });
      const slider = new Slider.Slider(percent / 100);
      slider.connect("notify::value", () => {
        const newVolume = Math.round(slider.value * baseVolume);
        console.log(
          `${stream.name}: slider_value=${slider.value} newVolume=${newVolume}`,
        )
        stream.set_volume(newVolume);
        stream.push_volume();
      })
      slider.x_expand = true;
      slider.style = "min-width: 140px";
      item.add_child(label);
      item.add_child(slider);
      this._indicator.menu.addMenuItem(item);
      this._streamItems.push(item);
    }
  }
  disable() {
    if (this._streamAddedId) {
      this._mixerControl.disconnect(this._streamAddedId);
      this._streamAddedId = null;
    }

    if (this._streamRemovedId) {
      this._mixerControl.disconnect(this._streamRemovedId);
      this._streamRemovedId = null;
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
