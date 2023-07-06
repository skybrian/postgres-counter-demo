import { useSignal } from "@preact/signals";
import { Counter } from "../lib/schema.ts";

export default function CounterButton(c: Counter) {
  const pressed = useSignal(false);

  const onClick = () => {
    pressed.value = true;
  };

  const classes = (pressed.value) ? "pressed" : "";

  return (
    <form method="POST" action="/increment">
      <input type="hidden" name="id" value={c.id} />
      <button class={classes} onClick={onClick}>{c.count} {c.symbol}</button>
    </form>
  );
}
