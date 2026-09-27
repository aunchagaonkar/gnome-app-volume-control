import St from 'gi://St';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import Gvc from 'gi://Gvc';

export default class AppVolumeControlExtension extends Extension {
    enable() {
        this._indicator = new PanelMenu.Button(0.0, this.metadata.name, false);
        const icon = new St.Icon({
            icon_name: 'audio-volume-high-symbolic',
            style_class: 'system-status-icon'
        });
        
        this._indicator.add_child(icon);
        const testItem = new PopupMenu.PopupMenuItem('No applicatios playing audio');
        testItem.connect('activate', () => {
            console.log('Test item clicked');
        })
        this._indicator.menu.addMenuItem(testItem);
        Main.panel.addToStatusArea(this.uuid, this._indicator);
        this._mixerControl = new Gvc.MixerControl({
            name: 'App Volume Control',
        })
        this._mixerControl.open();
        console.log('Gvc mixer opened');
        this._streamAddedId = this._mixerControl.connect('stream-added', (control, streamId) => {
            console.log(`Audio stream added: ${streamId}`);
        })
        console.log('App Volume Control: enabled');
    }

    disable() {
        if (this._streamAddedId) {
            this._mixerControl.disconnect(this._streamAddedId);
            this._streamAddedId = null;
        }
        this._mixerControl?.close();
        this._mixerControl = null;
        this._indicator?.destroy();
        this._indicator = null;
        console.log('App Volume Control: disabled');
    }
}