
export function makeNotificationBox(k, content) {
  const container = k.add([
    k.rect(500, 250),
    k.fixed(),
    k.opacity(0),
    k.pos(k.center()),
    k.area(),
    k.anchor("center"),
    {
      close() {
        k.destroy(this);
      },
    },
  ]);
  container.add([
    k.sprite("doublejump-ui"),
    k.anchor("center"),
    k.scale(1.5),
    
  ]);

  return container;
}