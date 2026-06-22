![alt text](https://wcp.cornradio.org/images/icons/image.png =500)

- 软件功能：在 macOS 顶栏点击即可切换到下一首音乐，支持主流音乐软件。
- 开发原因：
  - 系统自带操作需点击两下才能完成下一首：先打开控制键，再点击下一曲，还需要移动鼠标，非常麻烦。
  - 无法直接使用键盘按钮：用户使用小配列键盘，没有下一曲按钮；组合键操作同样繁琐。
- 当前：
  - 仅支持 M1 芯片。
  - 需执行特定命令后方可使用（因软件无证书，为自签名版本）。

```
xattr -cr /Applications/NextTrack.app
```

<br>
[蓝奏云 下载地址](https://kasusa.lanzoul.com/iy0SM3sk72of)