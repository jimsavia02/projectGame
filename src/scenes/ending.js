export function ending(k) {

k.scene("ending", () => {

    k.wait(1.5, () => {
        k.play("endingMusic", {
            loop: true,
            volume: 0.25,
            });
        });

        k.add([
            k.rect(k.width(), k.height()),
            k.color(0, 0, 0),
            k.pos(0, 0),
            k.fixed(),
        ]);

        const title = k.add([
            k.text("Thank you for playing demo!\nSee you again in the full version.", {
                size: 48,
                align: "center",
            }),
            k.pos(k.width() / 2, k.height() / 2),
            k.anchor("center"),
        ]);

        k.onKeyPress("enter", () => {
            music.stop();
            k.go("intro");
        });

    });

}