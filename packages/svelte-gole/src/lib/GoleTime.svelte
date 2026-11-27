<!--
  @component
  A time of day in Gole: hours, minutes and seconds are one symbol each.

  ```svelte
  <GoleTime />                                         live clock, [12]:[05]:[09]
  <GoleTime value={order.createdAt} format="HH:mm" />
  ```

  A live clock renders an empty `<time>` on the server and starts when the component
  is mounted; its timer stops when the component is destroyed. Default format `"HH:mm:ss"`.
-->
<script lang="ts">
  import GoleDate from "./GoleDate.svelte";
  import type { GoleTimeProps } from "./types.js";

  let { value, format = "HH:mm:ss", interval = 1000, ...rest }: GoleTimeProps = $props();

  let now = $state<Date>();

  // Effects do not run on the server, so the clock starts in the browser only.
  $effect(() => {
    if (value !== undefined) return;
    now = new Date();
    const timer = setInterval(() => (now = new Date()), interval);
    return () => clearInterval(timer);
  });

  const date = $derived(value ?? now);
</script>

{#if date !== undefined}<GoleDate value={date} {format} {...rest} />{:else}<time class={rest.class}></time>{/if}
