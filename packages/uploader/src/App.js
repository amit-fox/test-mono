import './App.css';
import MyDropzone from './Drop';
import Plugin from './custom/customGetter';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <MyDropzone 
          validation={{
            sync: {},
            asyncUri: 'http://validateme.com'
          }}
          />
      </header>
          {/* <hr/>
      <Plugin /> */}
    </div>
  );
}

export default App;
