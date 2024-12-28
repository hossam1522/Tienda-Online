import './App.css';
import Card from '../Components/Card/Card';
import useSWR from 'swr';
import { Routes, Route, Link } from 'react-router-dom';
import ProductDetail from '../Components/ProductDetail/ProductDetail';

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