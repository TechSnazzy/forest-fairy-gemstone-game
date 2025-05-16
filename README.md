# Forest Fairy Gemstone Game

A tiny browser‑based collecting game for my 5‑year‑old: drag a fairy around a forest background to scoop up endlessly‑spawning gemstones.
Written in plain HTML / CSS / vanilla ES‑modules—host it on GitHub Pages and it feels like a little web‑app on an iPhone home‑screen.

---

## 📸 Gameplay Preview

*(drop a GIF or screenshot here when you have one!)*

---

## ✨ Features

| Feature                | Notes                                                                                                                                    |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Drag‑to‑move fairy** | Touch / mouse. 96×96 sprite.                                                                                                             |
| **Random wandering**   | If you leave a fairy alone, it bounces, then roams like a Roomba (5 s idle → 5/10 s wander).                                             |
| **Gem spawning**       | New gem every 1.8 s. Collect to score.                                                                                                   |
| **Multiple fairies**   | +1 fairy after every 100 gems.                                                                                                           |
| **Lifespan**           | Each fairy lives *N* minutes (<span id="lifeVal">slider</span>)—plays *bling.mp3* and disappears. At least one fairy always stays alive. |
| **Live countdown**     | HUD shows “Next fairy: mm\:ss”.                                                                                                          |
| **Pause/Play & Reset** | UI buttons top‑right.                                                                                                                    |
| **Mobile‑friendly**    | Full‑screen on iOS when saved to home‑screen.                                                                                            |

---

## 📂 Folder structure

```
forest-fairy-gemstone-game/
│
├─ assets/
│   ├─ background.png
│   ├─ sprite.png
│   ├─ gemstone.png
│   └─ sounds/
│        ├─ plop.mp3   # gem‑collect sound
│        └─ bling.mp3  # fairy expiry sound
│
├─ src/
│   ├─ game.css   # all styles
│   ├─ game.js    # core engine (Fairy class, gems, logic)
│   └─ ui.js      # HUD wiring, buttons, slider, countdown
│
├─ index.html     # minimal wrapper ✅
└─ README.md      # you’re here
```

---

## 🚀 Quick start

```bash
# clone & serve
$ git clone https://github.com/<your-username>/forest-fairy-gemstone-game.git
$ cd forest-fairy-gemstone-game
$ npx live-server   # or python -m http.server
```

Open [http://localhost:8080](http://localhost:8080) and play.

### Deploy to GitHub Pages

1. Push this repo to **`main`** on GitHub.
2. In **Repo → Settings → Pages** choose “Deploy from *main / root*”.
3. After a minute your game is live at:

   ```
   ```

https\://<your-username>.github.io/forest-fairy-gemstone-game/

```
4. On iPhone Safari → **Share → Add to Home Screen** to make it an icon‑based web‑app.

---

## 🛠️ Development notes

* **ES‑modules** – `ui.js` imports `game.js`; no bundler required.
* **No external libs** – pure DOM/CSS/Canvas‑less. (Future: PixiJS canvas port for perf.)
* **Assets in `assets/`** – easy to swap sprites or sounds.
* **One feature per commit** and use branches like `feature/lifespan-slider`.
* **Performance tips**: cap gems (~80 max), use requestAnimationFrame, consider object‑pooling.

---

## 📜 License

MIT.  
Sprites / sounds are © their original creators—replace with your own if you intend to redistribute.

```
