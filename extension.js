import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

export default class AppVolumeControlExtension extends Extension {
    enable() {
        console.log('App Volume Control: enabled');
    }

    disable() {
        console.log('App Volume Control: disabled');
    }
}