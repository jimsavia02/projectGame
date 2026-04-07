export function intro(k) {

  k.setBackground(k.rgb(0, 0, 0));
  const logo = k.add([
    

  ]);


   function makeMenuButton(label, y, onClick) {

 const btn = k.add([
  k.text("Play", {
    font: "Zaslia",
    size: 80,
  }),
  k.pos(k.width() * 0.15, 300),
  k.anchor("left"),
  k.area(),
  k.color(255, 255, 255),
])

k.onUpdate(() => {
  if (btn.isHovering()) {
    btn.color = k.rgb(255, 220, 120)
  } else {
    btn.color = k.rgb(255, 255, 255)
  }
})

btn.onClick(onClick);

  return btn;
}


makeMenuButton("Play", 300, () => {
  k.go("room3",{ exitName: null })

});


  

  
}
