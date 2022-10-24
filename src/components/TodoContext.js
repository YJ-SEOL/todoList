import React, { useReducer, createContext, useContext, useRef } from "react";

const initialTodos = [
    {
        id: 1,
        text: "프로젝트 생성하기",
        done: true,
    },
    {
        id: 2,
        text: "컴포넌트 스타일링하기",
        done: true,
    },
    {
        id: 3,
        text: "Context 만들기",
        done: false,
    },
    {
        id: 4,
        text: "기능 구현하기",
        done: false,
    },
];

function todoReducer(state, action) {
    switch (action.type) {
        case "CREATE":
            return state.concat(action.todo);
        case "TOGGLE":
            return state.map((todo) => (todo.id === action.id ? { ...todo, done: !todo.done } : todo));
        case "REMOVE":
            return state.filter((todo) => todo.id !== action.id);
        default:
            throw new Error(`Unhandled action type: ${action.type}`);
    }
}

// state와 dispatch를 Context를 통해 다른 컴포넌트에서 바로 사용할 수 있게 만들기
// Context 하나를 만들어서 state와 dispatch를 함께 넣어주는 대신, 두개의 Context를 만들어 따로 넣어줄 것
// 따로 만들어주면 dispatch만 필요한 컴포넌트에서 불필요한 렌더링 방지
// 추가적으로, 사용하게 되는 과저에서 편리하기도 함.

const TodoStateContext = createContext();
const TodoDispatchContext = createContext();
const TodoNextIdContext = createContext();

export function TodoProvider({ children }) {
    const [state, dispatch] = useReducer(todoReducer, initialTodos);
    const nextId = useRef(5);
    return (
        <TodoStateContext.Provider value={state}>
            <TodoDispatchContext.Provider value={dispatch}>
                <TodoNextIdContext.Provider value={nextId}>{children}</TodoNextIdContext.Provider>
            </TodoDispatchContext.Provider>
        </TodoStateContext.Provider>
    );
}

// 컴포넌트에서 useContext를 직접 사용하는 대신, useContext를 사용하는 커스텀 Hook만들어서 보내줌
export function useTodoState() {
    return useContext(TodoStateContext);
}

export function useTodoDispatch() {
    return useContext(TodoDispatchContext);
}

// nextId값을 위한 Context
// nextId가 의미하는 값은 새로운 항목을 추가할 때 사용할 고유 ID
// 이 값은 useRef를 사용하여 관리
export function useTodoNextId() {
    const context = useContext(TodoNextIdContext);
    // useTodoStatd, useTodoDispatch, useTodonextId Hook을 사용하려면,
    // 해당 컴포넌트가 TodoProvider컴포넌트 내부에 렌더링되어야 함.
    // 만약 TodoProvider로 감싸져있지 않다면 에러를 발생시키도록 커스텀 Hook 수정
    // todo: Context사용을 위한 커스텀 Hook을 만들때 이렇게 에러처리를 한다면,
    // todo: 나중에 실수하게 됐을 때 문제점을 빨리 발견할 수 있음.
    if (!context) {
        throw new Error("Cannot find TodoProvider");
    }
    return context;
}
