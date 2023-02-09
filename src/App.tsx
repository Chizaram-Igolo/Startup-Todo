import React, { useEffect, useState } from "react";
import "./App.css";

interface ITask {
  id: number;
  task: string;
  done: boolean;
}

interface IPhaseObj {
  id: number;
  phase: string;
  tasks: ITask[];
}

interface IRandomFactRespObj {
  id: string;
  language: string;
  permalink: string;
  source: string;
  source_url: string;
  text: string;
}

function App() {
  const [todoObj, setTodoObj] = useState<IPhaseObj[]>([]);

  const [phaseVal, setPhaseVal] = useState("");
  const [taskVal, setTaskVal] = useState("");

  const [newTaskInputIdx, setNewTaskInputIdx] = useState<string | null>(null);

  const [randomFact, setRandomFact] = useState("");

  // Helper function for retrieving local state.
  function getLocalTodoObj() {
    return JSON.parse(window.localStorage.getItem("todoObj") as string);
  }

  // Hydrate the component or prepare the memory object on first load.
  useEffect(() => {
    if (window.localStorage.getItem("todoObj") === null) {
      window.localStorage.setItem("todoObj", JSON.stringify([]));
    } else {
      setTodoObj(getLocalTodoObj());
    }
  }, [window.localStorage]);

  // Fetch random fact when all phases are complete.
  useEffect(() => {
    const url = "https://uselessfacts.jsph.pl/random.json";

    const localTodoObj = getLocalTodoObj() as IPhaseObj[];

    const allTasks = localTodoObj.map((item) => item.tasks).flat();

    // If not all tasks are complete
    if (allTasks.length > 0 && allTasks.every((task) => task.done === true)) {
      const fetchData = async () => {
        try {
          const response = await fetch(url);
          const json = (await response.json()) as IRandomFactRespObj;

          setRandomFact(json.text);
        } catch (error) {
          setRandomFact("Error: " + error);
          console.log("error", error);
        }
      };
      fetchData();
    } else {
      setRandomFact("");
    }
  }, [todoObj]);

  function handleAddPhase() {
    if (phaseVal) {
      const count = todoObj.length; // new Index
      const newTodoObj = [
        ...getLocalTodoObj(),
        { id: count, phase: phaseVal, tasks: [] },
      ];

      window.localStorage.setItem("todoObj", JSON.stringify(newTodoObj));

      // Update application state
      setPhaseVal("");
      setTodoObj(JSON.parse(window.localStorage.getItem("todoObj") as string));
    }
  }

  function handleAddTask(phaseId: number) {
    if (taskVal) {
      const localTodoObj = getLocalTodoObj() as IPhaseObj[];

      // Find the phase
      const phaseIdx = localTodoObj.findIndex((todo) => todo.id === phaseId);
      const localPhase = localTodoObj[phaseIdx];

      // Add task
      const count = localPhase.tasks.length;
      localPhase.tasks = [
        ...localPhase.tasks,
        { id: count, task: taskVal, done: false },
      ];
      localTodoObj[phaseIdx] = localPhase;

      window.localStorage.setItem("todoObj", JSON.stringify(localTodoObj));

      // Update application state
      setTaskVal("");
      setTodoObj(JSON.parse(window.localStorage.getItem("todoObj") as string));
    }
  }

  function handleUpdateTask(phaseId: number, taskId: number) {
    const localTodoObj = getLocalTodoObj() as IPhaseObj[];

    // Find the phase
    const phaseIdx = localTodoObj.findIndex((todo) => todo.id === phaseId);
    const localPhase = localTodoObj[phaseIdx];

    // Find the task
    const taskIdx = localPhase.tasks.findIndex((task) => task.id === taskId);
    const localTask = localPhase.tasks[taskIdx];

    if (!localTask.done) {
      localTask.done = true;
    } else {
      localTask.done = false;
    }

    // Update the task and phase.
    localPhase.tasks[taskIdx] = localTask;
    localTodoObj[phaseIdx] = localPhase;

    window.localStorage.setItem("todoObj", JSON.stringify(localTodoObj));

    // Update application state
    setTaskVal("");
    setTodoObj(JSON.parse(window.localStorage.getItem("todoObj") as string));
  }

  return (
    <div className="App">
      <header className="App-header">
        <h2>My startup progress</h2>
        <div>
          <p>{randomFact}</p>
        </div>

        {todoObj.map((i, idx) => (
          <div key={idx}>
            <h3>
              <span>{idx + 1}</span>&nbsp;{i?.phase}{" "}
              {i.tasks.length > 0 &&
                i.tasks.every((task) => task.done === true) &&
                "✔"}
            </h3>

            {i?.tasks?.map((t, tIdx) => (
              <div key={tIdx}>
                <input
                  type="checkbox"
                  id="doneStatus"
                  name="doneStatus"
                  checked={t.done || false}
                  onChange={() => handleUpdateTask(i.id, tIdx)}
                  disabled={
                    i.id > 0 &&
                    todoObj.findIndex(
                      (todo) =>
                        todo.id < i.id &&
                        todo.tasks.some((task) => task.done !== true)
                    ) !== -1
                  }
                />
                &nbsp;
                <label>{t.task}</label>
              </div>
            ))}

            {newTaskInputIdx !== idx.toString() && (
              <a
                href="#"
                onClick={() => setNewTaskInputIdx(idx.toString())}
                style={{ display: "inline-block", marginTop: "8px" }}
              >
                Add task
              </a>
            )}

            {newTaskInputIdx === idx.toString() && (
              <div className="newTaskDiv">
                <input
                  type="text"
                  id="taskVal"
                  value={taskVal}
                  placeholder="Enter new Task"
                  onChange={(e) => setTaskVal(e.target.value)}
                />
                <button onClick={() => handleAddTask(i.id)}>Add Task</button>{" "}
              </div>
            )}
          </div>
        ))}
        <div className="newPhaseDiv">
          <input
            type="text"
            id="phaseVal"
            value={phaseVal}
            placeholder="Enter new Phase"
            onChange={(e) => setPhaseVal(e.target.value)}
          />
          <button onClick={handleAddPhase}>Add Phase</button>{" "}
        </div>
      </header>
    </div>
  );
}

export default App;
