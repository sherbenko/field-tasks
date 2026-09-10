const { withAndroidManifest, withDangerousMod } = require('expo/config-plugins');
const { mkdir, writeFile } = require('node:fs/promises');
const path = require('node:path');

module.exports = function withFieldTasksIcon(config) {
  config = withAndroidManifest(config, result => {
    const application = result.modResults.manifest.application[0].$;
    application['android:icon'] = '@drawable/field_tasks_icon';
    application['android:roundIcon'] = '@drawable/field_tasks_icon';
    return result;
  });
  return withDangerousMod(config, ['android', async result => {
    const directory = path.join(result.modRequest.platformProjectRoot, 'app/src/main/res/drawable');
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, 'field_tasks_icon.xml'), `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
  android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108">
  <path android:fillColor="#176348" android:pathData="M0,0H108V108H0Z" />
  <path android:fillColor="#E3F0E8" android:pathData="M54,22C37,22 26,34 26,49C26,68 54,88 54,88C54,88 82,68 82,49C82,34 71,22 54,22Z" />
  <path android:fillColor="@android:color/transparent" android:strokeColor="#176348"
    android:strokeWidth="6" android:strokeLineCap="round" android:strokeLineJoin="round"
    android:pathData="M41,49L50,58L67,40" />
</vector>`);
    return result;
  }]);
};
