# Práctica 6

## Puesta a punto

Para realizar la práctica, se han seguido los pasos establecidos en la documentación ligada a la práctica. En primer lugar, se ha creado el proyecto siguiendo la guía indicada en https://tailwindcss.com/docs/guides/vite. Los pasos seguidos han sido los siguientes:

1. Crear un nuevo proyecto con Vite.

```bash
npm create vite@latest P6 -- --template react
cd P6
```

2. Instalar Tailwind CSS.

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

3. Configurar Tailwind CSS.

En el archivo `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

4. Añadir las directivas de Tailwind CSS en el archivo `index.css`.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Luego, se ha instalado daisyUI siguiendo la guía indicada en https://daisyui.com/docs/install/. Los pasos seguidos han sido los siguientes:

1. Instalar daisyUI.

```bash
npm i -D daisyui@latest
```

2. Añadir daisyUI en el archivo `tailwind.config.js`.

```javascript
module.exports = {
  //...
  plugins: [
    require('daisyui'),
  ],
}
```

Para acabar instalando swr, lo cual se ha hecho siguiendo la guía indicada en https://swr.vercel.app/es-ES/docs/getting-started. Los pasos seguidos han sido los siguientes:

```bash
npm i swr
```

Para el apartado de nota extra, ha sido necesario instalar react-router-dom, lo cual se ha hecho mediante el siguiente comando:

```bash
npm install react-router-dom
```

Y, finalmente, para poner a funcionar la aplicación, se usa el siguiente comando:

```bash
npm run dev
```

## Desarrollo

Para la realización de la práctica, se ha creado un archivo llamado `Card.jsx` el cual contiene los recuadros que se muestran en la página principal, mostrando cada recuadro un producto, con su imagen, título, descripción y un botón para comprar. Para ello, se ha utilizado el siguiente código:

```jsx
import React from "react";
import { Link } from "react-router-dom";

const Card = ({ product }) => {
  return (
    <div id="card">
      <img src={product.image} alt="product" />
      <h2>{product.title}</h2>
      <p>{product.description.substring(0, 50)}</p>
      <Link to={`/product/${product.id}`}>
        <button>Buy now</button>
      </Link>
    </div>
  );
};

export default Card;
```

Después de ello, en el archivo `App.jsx`, mediante el uso de swr, se ha obtenido la información de los productos de la API y, haciendo uso de la función `Card`, se han mostrado en la página principal. El código utilizado ha sido el siguiente:

```jsx
const fetcher = (url) => fetch(url).then((res) => res.json());

const App = () => {
  const { data, error } = useSWR('https://fakestoreapi.com/products', fetcher);

  if (error) return <div>Error loading products.</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <Routes>
      <Route path="/" element={
        <div className="App">
          {data.map((product) => (
            <Card key={product.id} product={product} />
          ))}
        </div>
      } />
      <Route path="/product/:id" element={<ProductDetail products={data} />} />
    </Routes>
  );
};

export default App;
```

Mencionar que ha sido necesario modificar el archivo `App.css` para que los recuadros se muestren en forma de cuadrícula y se vieran, más o menos, como se nos pide en la práctica. 

### Nota extra

Como se ha mencionado anteriormente, para hacer el apartado de nota extra, se ha utilizado react-router-dom. Para ello, se ha creado un archivo llamado `ProductDetail.jsx` el cual muestra la información detallada de un producto en concreto. Para ello, se ha utilizado el siguiente código:

```jsx
const ProductDetail = ({ products }) => {
  const { id } = useParams();
  const product = products.find((product) => product.id === parseInt(id));

  if (!product) {
    return <div className="not-found">Producto no encontrado.</div>;
  }

  return (
    <div className="product-detail">
      <div className="product-content">
        <img className="product-image" src={product.image} alt={product.title} />
        <h2 className="product-title">{product.title}</h2>
        <p className="product-description">{product.description}</p>
        <p className="product-price">Precio: ${product.price}</p>
        <button className="add-to-cart-btn">Agregar al Carrito</button>
      </div>
    </div>
  );
};

export default ProductDetail;
```

Después, el archivo `main.jsx` ha sido modificado para que se pueda hacer uso de react-router-dom. El código utilizado ha sido el siguiente:

```jsx
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
```

Por último, se ha modificado el archivo `App.css` para que la página de detalle de un producto se vea cuando accedamos a la página de un producto en concreto, cosa que ocurre cuando le damos click al botón de comprar en la página principal, como viene especificado en el archivo `Card.jsx`. Comentar que ha hecho falta modificar el archivo `App.css` para que la página se vea correctamente.