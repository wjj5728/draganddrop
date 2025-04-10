import DragAndDropLists from './components/DragAndDropLists'
import './App.css'
import Grid from './components/pragmatic'

function App() {
  return (
    <div className="App">
      <h1>多列表拖拽示例</h1>
      <DragAndDropLists />

      <h1>prigmatic拖拽</h1>
      <Grid />
    </div>
  )
}

export default App
