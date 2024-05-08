import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './Home';
import ProductDetail from './ProductDetail';

const App: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/product/:productId" component={ProductDetail} />
      </Switch>
    </Router>
  );
}

export default App;
