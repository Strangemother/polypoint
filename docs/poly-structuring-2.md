# Poly-Structure!

[![npm version](https://img.shields.io/npm/v/poly-structure.svg)](https://www.npmjs.com/package/poly-structure)
[![Build Status](https://img.shields.io/travis/yourusername/poly-structure.svg)](https://travis-ci.com/yourusername/poly-structure)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

*A dynamic JavaScript library for late-stage class augmentation and property injection.*

---

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
  - [Naming the Global Object](#naming-the-global-object)
- [Getting Started](#getting-started)
  - [Basic Usage](#basic-usage)
- [Examples](#examples)
  - [Larger Example](#larger-example)
  - [Inheritance Compliance](#inheritance-compliance)
  - [Pre-Mixin](#pre-mixin)
  - [Fence Hopping Head Space](#fence-hopping-head-space)
- [License](#license)
- [Contributing](#contributing)
- [Contact](#contact)

---

```js
// Assume Polypoint is already included and available as 'Polypoint'

// 1. Define a simple class
class Animal {
  speak() {
    return 'Moo Woof Meow';
  }
}

// 2. Install the class into Polypoint
Polypoint.head.install(Animal);

// 3. Create an instance of the class
const animal = new Animal();
console.log(animal.speak()); // Output: 'Moo Woof Meow'

// 4. Dynamically add new properties and methods to the class
Polypoint.head.mixin('Animal', {
  type: {
    value: 'Mammal',
    writable: true,
  },
  speak: {
    value: function () {
      return `I am a ${this.type}`;
    },
  },
});

// 5. Existing instances now have the new properties and methods
console.log(animal.type);    // Output: 'Mammal'
console.log(animal.speak()); // Output: 'I am a Mammal'

// 6. New instances also have the new properties and methods
const anotherAnimal = new Animal();
console.log(anotherAnimal.type);    // Output: 'Mammal'
console.log(anotherAnimal.speak()); // Output: 'I am a Mammal'
```

---

## Introduction

**Poly-Structure** offers a clever and classy integration that allows you to install properties before and after a class exists. It empowers developers to enhance classes dynamically, promoting flexibility and modularity in your JavaScript applications.

---

## Features

- **Define Classes Without the Magic**: Keep your classes clean and straightforward without unnecessary complexity.
- **Ready-to-Go Global Object**: Start using Poly-Structure immediately with a global object that's easy to access and manage.
- **Lazy Install Any Property or Method**: Add properties or methods to your classes whenever you need them, even after instantiation.
- **Pre or Late Stage Mixins**: Flexibly compose your classes before or after they're defined, allowing for dynamic enhancements.

---

## Installation

To get started, include the assets within your scope or page:

```html
<script src="../point_src/core/head.js" name="mylib"></script>
```