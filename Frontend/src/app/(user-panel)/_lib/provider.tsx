'use client'

import React from "react"
import { Provider } from "react-redux"
import { createStore, PreloadedState } from "./store"

const ReduxProvider = ({
    preloadedState,
    children
}: {
    preloadedState: PreloadedState,
    children: React.ReactNode
}) => {

    const store = createStore({
        user: preloadedState.user
    })

    return (<Provider store={store}>
        {children}
    </Provider>
    )
}

export default ReduxProvider