import './App.css';
import { GlobalStyle } from './globalStyle.tsx';
import { useDispatch } from 'react-redux';
import { doLogin } from './redux/reducers/auth.ts';

function App() {
  const dispatch = useDispatch();

  const onClick = () => {
    // @ts-expect-error for now
    dispatch(doLogin());
  };

  return (
    <>
      <GlobalStyle/>
      <button onClick={onClick}>Vai</button>
    </>
  );
}

export default App;
