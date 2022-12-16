# WebAdmin for CServer

This plugin implements web-based user interface for [CServer](https://github.com/igor725/cserver).
WebAdmin allows you to manage your server via browser.

There are three tabs:
* Home - here you can get basic information about your server (such as software version, RAM usage, online players, uptime, list of the loaded worlds, kick/ban/op/de-op any player)
* Terminal - on this tab you can execute any server commands and read the latest logs
* Plugin manager - allows you to control loaded plugins or scripts (with cs-lua installed).

# Installation

Since [cserver v0.7.0](https://github.com/igor725/cserver/releases/tag/v0.7.0) (not yet released), this plugin is the part of default plugins set. All you need to do is download this release, run the server, and configure WebAdmin as you need.

# Dependicies

**Frontend (These modules will be automatically downloaded on building):**

0. nodejs + npm
1. react >= 18.2.0
2. react-fontawesome >= 0.2.0
3. react-router-dom >= 6.4.3
4. react-toastify >= 9.1.1
5. react-use-websocket >= 4.2.0
6. react-dark-mode-toggle-2 >= 2.0.7
7. babel-plugin-macros >= 3.1.0
8. md5-js-tools >= 1.0.2
9. ansi-to-html >= 0.7.2

**Backend:**

0. [CServer](https://github.com/igor725/cserver) >= 0.7.0
1. [cs-base](https://github.com/igor725/cs-base) (optional)
2. [cs-lua](https://github.com/igor725/cs-lua) (optional)

# Building

This plugin builds just like any other cserver plugin. If you don't know how to do it, you can read compiling guide [here](https://docs.igvx.ru/Compilation/).

**Note:** To compile frontend along with the plugin, you need to pass the `wbuild` plugin argument to the build script.
