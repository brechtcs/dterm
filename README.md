# dterm

Distributed Terminal, forked from [Webterm](https://github.com/pfrazee/webterm). Provides powerful tools for browsing and creating on the distributed web. People familiar with Unix-style terminals will feel right at home!

Try it at `dat://dterm.hashbase.io` in [Beaker Browser](https://beakerbrowser.com).


## Getting started

When opening dterm, you have to navigate into the dat archive you want to work with. For this you can use `cd <dat-key-or-domain>`. Alternatively, you can call `dat ls` which will display a list of dats available from your Beaker library.

For this tutorial though, let's create an empty archive. The following command will open Beaker's "New archive" modal, and navigate to the newly created dat when you confirm:

```bash
> dat create --title="Hello World! --description="Getting started with dterm"
```

Let's create our first command in this archive. When evaluating a prompt, dterm will look for corresponding commands in the archive's `/commands` folder. So let's create that one first:

```bash
> mdkir commands
```

To create our new command in this folder, we'll also need a text editor. The following commands will one for you:

```bash
> term install dat://dcode.hashbase.io/commands/code.js
# A basic editor based on CodeMirror

> term install dat://dcode.hashbase.io/commands/emacs.js
# Same, but with Emacs keybindings

> term install dat://dcode.hashbase.io/commands/vim.js
# Same, but with vim keybindings
```

After this, run `code commands/hello-world.js` (or vim/emacs if that's what you went for) and an editor window will open in a new tab. Enter the following code to define a basic command and press `Control-S` (or the corresponding vim/emacs command) to save:

```js
// hello-world.js
export default function () {
  return 'Hello, world!'
}
```

As you see, our command is a basic ES module file. When invoked, dterm will execute the default export function like so:

```bash
> hello-world
Hello, world!
```

## Defining commands

### Arguments

All command modules export a default function which accepts an options object and positional arguments, and returns a JS value or object. Here's an example which echos the arguments:

```js
// echo.js
export default function (opts, ...args) {
  return JSON.stringify(opts) + args.join(' ')
}
```

Invocation:

```bash
> echo -abc --hello world this is my echo
{"a": true, "b": true, "c": true, "hello": "world"} this is my echo
```

### Subcommands

All non-default exports on a command module can be accessed as subcommands. This is a help function for the above `echo` example:

```js
// echo.js
export function help () {
  return 'echo <opts> [...args]'
}
```

Invocation:

```bash
> echo help
echo <opts> [...args]
```

### Rendering

The command may specify a `toHTML` function on the response object. This method will be invoked if/when the output is rendered to the cli.

```js
// hello-big-world.js
export default function () {
  return {
    toHTML: () => '<h1>HELLO WORLD!</h1>'
  }
}
```

### Async

Commands may be async.

```js
// wait1s.js
export default async function (opts) {
  await new Promise(resolve => setTimeout(resolve, 1e3))
}
```

### Streams

Commands can return iterators. These will be rendered item-per-item as streams.

```js
export default function* (opts) {
  var n = Number(opts.n) || 0

  for (var i = 0; i < n; i++) {
    yield 'streaming: ' + (i + 1)
  }
}
```

### Errors

Any `Error` instances returned (or yielded) by the command will be rendered as errors in the terminal.

```js
export default function (opts, file) {
  try {
    return await archive.readFile(file)
  } catch (err) {
    return err
  }
}
```

## Builtins

A range of commands for basic operations is already included in dterm out of the box. Enter `help` in your terminal to get a complete overview.

## License

AGPL-v3.0 (previously [MIT](https://github.com/dterm/dterm/releases/tag/MIT))
