# `SaurScript`
Dead-simple functional `JavaScript` transpiler.

`SaurScript` looks like this:
```kotlin
String myName = "Computer"
fun sayHi(String name) > String {
  return concat("Hello ", name)
}
String greeting = sayHi(myName)
logger.log(greeting)
```
It compiles to `JavaScript`:
```javascript
const myName = "Computer";
const greeting = (function(name = myName) {
  return "Hello " + name;
})();
console.log(greeting)
```

### Features
* Functional
* Pure
* Statically typed
* Lazy
* Easy to learn

### Concept
A lot of functional programming languages use unfamiliar syntax:
```haskell
myName = "Computer"

sayHi :: String -> String
sayHi name = "Hello " ++ name

greeting = sayHi myName
main = print greeting
```
This can make it hard to learn. `SaurScript` uses more familiar syntax, making it easier to learn.

# Learn `SaurScript`
To learn how to use `SaurScript` we're going to create a the**saur**us.

### Imports
Usually you'll want to import either the `common` or `browser` library to start.
These give you access to `logger`, `document`, `storage`, `map`, `strConcat`, `filter`, and other useful tools.
You can also import other `.saur` files.
```kotlin
// The common lib:
@import 'common'
// The browser lib (this includes common, but is only for frontend dev. Don't use both):
@import 'browser'
// Another `.saur` file:
@import 'myOtherFile'
```

### Variables
Variables in `SaurScript` are immutable and statically typed.
```kotlin
Int myVar = 5
```
This will compile to:
```javascript
const myVar = 5;
```
You must specify a type to create the variable. Once you create the variable, you cannot change it.

Don't think of variables as boxes where you can take things in and out.
Think of the variable name as a word in our thesaurus, and the value is the synonyms.

Let's create an entry for our thesaurus:
```kotlin
Dictionary<String:Array<String>> entries = ["Dinosaur": "Dino", "Raptor", "Big Lizard"]
```
Here we declare a new variable named `entries`. It's type is a `Dictionary`.
The key of the dictionary is a `String` (a word), and the value is an `Array` of `String`s (synonyms).

### Functions
Functions are lazy. If we don't use the function, it won't show up in our `JavaScript` code.
```kotlin
fun myFunction(Int arg1, Float arg2) -> Bool {
  logger.log(arg1 + arg2)
  return true
}
```
Since we don't use this function, our `JavaScript` file is empty.

Let's add a function to our thesaurus to get the synonyms for any given word.
```kotlin
fun synonyms(String word) -> Array<String> {
  return entries[word]
}
```

### Classes
Classes are an experimental feature of `SaurScript`. They mix the `Functional` and `Object Oriented` paradigms.
```kotlin
@class MyClass
  @property Int id = 0
  fun whoami() -> String {
    return "A Computer"
  }
@endclass
@new MyClass myInstance(5)
logger.log(myInstance.whoami())
```
This will compile to:
```javascript
function MyClass(id = 0) {
  this.id = id;
};
MyClass.prototype = {
  whoami: function() {
    return "A Computer"
  }
}
const myInstance = new MyClass(5)
console.log(myInstance.whoami())
```
Now we can create a class for each entry in our thesaurus:
```kotlin
@class Entry
  @property String word = ""
  @property Array<String> synonyms = []
@endclass
```
And a class for the thesaurus itself:
```kotlin
@class Thesaurus
  @property String name = ""
  @property String publisher = ""
  @property Array<Any> entries = []
@endclass
```
And we can create a thesaurus!
```kotlin
@new Entry dino("Dino", ["Dinosaur", "Raptor", "T-Rex"]
@new Entry lizard("Lizard", ["Iguana", "Gecko", "Monitor"]
@new Entry paradigm("Paradigm", ["Functional", "Imperative", "Object Oriented"]
@new Thesaurus thesaurus("SaurScript Thesaurus", "SaurScript Language", [dino, lizard, paradigm])
```

### If, Else If, and Else
```kotlin
if myCondition == "yes" {
  logger.log("Agreed")
} elif myCondition != "maybe" {
  logger.log("So you're telling me there's a chance")
} else {
  logger.log("Not at all")
}
```

### Repeat
`SaurScript` doesn't have `for` or `while` loops. Instead, you can use recursion, or `repeat`.
```kotlin
repeat 3 {
  logger.log("Hi")
}
```
Output:
```sh
Hi
Hi
Hi
```
We can use recursion to print all of the synonyms in our thesaurus:
```kotlin
@class Thesaurus
  ...
  fun allSynonyms(Int index = 0, Array<String> soFar) {
    if entries[index] != null {
      allSynonyms(index + 1, arrConcat(soFar, entries[index])
    } else {
      logger.log(soFar)
    }
  }
@endclass
```

### Exports
Sometimes you want to export something for use in another `.saur` file.
You can add `@export` in front of a variable, class, function, etc. to make it available outside the file.
```kotlin
@export String myName = "Carson"

@export @class myClass
  @property String greeting = "Hello World"
@endclass

@export @new myClass greeter(strConcat("Hello ", myName))

@export fun sayHi(Any greeterClass) > String {
  return greeterClass.greeting
}
```
It can now be imported from another `.saur` file:
```kotlin
@import 'myFile'
// We can now access everything @exported from the other file:
logger.log(sayHi(greeter))
```
