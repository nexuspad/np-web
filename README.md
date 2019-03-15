# np-web

This project is created for the new version of nexuspad.com. And I want to use this project to document my way of building web application, and probably more importantly, put it in practice.
Since this is an open source project, you are welcome to contribute, whether through sharing your thoughts or contributing to the code.


## What is nexuspad?
I built this product to manage my digital information. There are many similar products out there today, such as MicroSoft OneNote, Evernote, or many cloud-based service in general. And each one of them has its unique strength and capabilities. So does nexuspad.
I want to continue to develop this product with incorporation of more exciting features, from secured encryption, information classification through machine learning, to complete offline capability, just to name a few.


## Some design principles for this web application
- Use JavaScript (ES6) to build the core service layer, which is designed independently for data and business logic
- Value lightweight UI framework over large eco-system
- Think user interface as various state and visible components, instead of URLs and pages
- Test scripts are there and they are especially useful for the core layer. However I don't want to go overboard to make it TDD.
- Directories are kept flat intentionally

## Building independent UI components
The project's /dev/ module is a collection of components that will eventually become the site.
The are organized and developed separately so I can test out different ideas.
The practice is to develop fully functional components in a "lab" first. To achieve the goal that they are independent, re-usable and they need to manage data properly.
The actual "assemble" of the components into the application comes last. 

Just to elaborate a bit on the term "component":
It's more than just a UI widget. A truly functional object in an application should also have these aspects defined, conforming to a design philosophy and approaches that are most suitable for the application.

- functional capability
- properties for initial state
- routing / transition
- state and data management


## Some design decisions
- Data type definition and service layer are inside "core" folder
- UI components are organized based on top level functional modules (bookmark, doc, calender...), and sharable components are inside "common"
- There are certain re-usable UI routines that are implemented and shared across in Vue components through "mixin". These are called "Providers" in this app.
- It's important to design the workflow so that proper component handles the most revelent calls. For instance, a "bulk delete" action on list should be implemented inside the list module.

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run all tests
npm test
```