import { state, statePropsEnum } from "../state/globalState";
export function gameover(k, data) {

  k.add([
    k.rect(k.width(), k.height()),
    k.color(0, 0, 0),
    k.pos(0, 0),
    k.fixed(),
  ]);

  k.add([
    k.text("YOU DIED", {
      size: 60,
      align: "center",
    }),
    k.pos(k.width() / 2, k.height() / 2 - 80),
    k.anchor("center"),
    k.fixed(),
  ]);

  const btn = k.add([
    k.rect(200, 60),
    k.pos(k.width() / 2, k.height() / 2 + 20),
    k.anchor("center"),
    k.area(),
    k.color(0, 0, 0),
    k.outline(4, k.rgb(255, 0, 0)),
    k.fixed(),
    "respawn-btn"
  ]);

  k.add([
    k.text("RESPAWN", {
      size: 24,
    }),
    k.pos(btn.pos),
    k.anchor("center"),
    k.fixed(),
  ]);

  btn.onHover(() => {
    btn.color = k.rgb(255, 0, 0);
  });

  btn.onHoverEnd(() => {
    btn.color = k.rgb(0, 0, 0);
  });

  // 🔥 คลิกปุ่ม
  btn.onClick(() => {
    k.go(state.current().lastRoom);
  });

  // 🔥 กด R ก็ได้เหมือนเดิม
  k.onKeyPress("r", () => {
    k.go(state.current().lastRoom);
  });
}