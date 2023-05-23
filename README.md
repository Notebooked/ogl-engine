<p align="center">
  <img src="https://github.com/oframe/ogl/raw/master/examples/assets/ogl.png" alt="OGL" width="510" />
</p>

<h1 align="center">OGL Engine</h1>

<p align="center"><b>Minimal WebGL game engine built on the OGL library.</b></p>

<br />

⚠️ *Note: currently in alpha, so expect everything to change every single commit.*

OGL is a small, effective WebGL library aimed at developers who like minimal layers of abstraction, and are interested in creating their own shaders.

OGL Engine essentially makes working with OGL easier, while also adding in essential game engine components such as physics and input management.

## Install

Clone the repository and open the folder in a console. With node installed and in the correct directory, run this command:
`node app.js`

## Examples

There are a few examples provided with the engine, and there will probably be more as it is worked on longer.

## Usage

Main stuff:
```js
import { ... } from './path/to/src/index.mjs';
```
Physics stuff:
```js
import { ... } from './path/to/src/physics2d/...';
```

## Structure

In an attempt to keep things light and modular, the library is split up into three components: **Math**, **Core**, and **Extras**.

The **Math** component is an extension of [gl-matrix](http://glmatrix.net/), providing instancable classes that extend Array for each of the module types. 8kb when gzipped, it has no dependencies and can be used separately.

The **Core** is made up of the following:
 - Geometry.js
 - Program.js
 - Renderer.js
 - Camera.js
 - Transform.js
 - Mesh.js
 - Texture.js
 - RenderTarget.js

Any additional layers of abstraction will be included as **Extras**, and not part of the core as to reduce bloat. These provide a wide breadth of functionality, ranging from simple to advanced.

## Unlicense

This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <https://unlicense.org>