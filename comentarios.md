# Comentarios

## 1 

```js
async function homeAdmin(req, res)
```
Cambiar el nombre de la funcion por index que es mas intuitivo

## 2

```js
async function show(req, res) 
async function create(req, res) 
async function store(req, res) 
async function edit(req, res) 
async function update(req, res)
async function destroy(req, res)
```

Eliminar las funciones que no se usan

## 3

```js
if (!apiArticle) {
    res.status(404).send("Not Found");
  } else {
    res.json(apiArticle);
  }

if (!apiArticle) {
    return res.status(404).send("Not Found");
  } 
return res.json(apiArticle);
  
```

Evitar uso de else

## 4 

Ordenar rutas según responsabilidades



