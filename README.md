#install npm dependencies

```bash
npm install
```

# Install cordova plugins and platforms

```bash
ionic state restore
```

# Update platform

```bash
cordova platform update ios
```

# generate resources

```bash
ionic resources
```

##Android

# install java
brew cask install java

# install android sdk
brew install android-sdk

# add android home to path and source path
echo "export ANDROID_HOME=/usr/local/opt/android-sdk" >> ~/.bash_profile
source ~/.bash_profile

#install android build tools / platform tools & sdk
android

# select latest build tools / platform tools and download android sdk 23 (v6)
ionic run android

- open chrome dev tools > options > more tools > inspect devices > inspect

- for emulation download system images, and intel HAXM to speed things up

- tap build number 5 or 7 or 9 or something times to enable dev tools

##ios

- safari > preferences > dev menu checkbox > develop on toolbar > simulator
