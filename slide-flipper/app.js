// app.js — App lifecycle entry point (Zepp OS v3)
import { BaseApp } from '@zeppos/zml/base-app'

App(
  BaseApp({
    globalData: {},
    onCreate() {
      this.log('SlideFlipper app onCreate')
    },
    onDestroy() {
      this.log('SlideFlipper app onDestroy')
    },
  }),
)
