const initialState = {
    signup: {
        email: ""
    }
};

const Reducer = (state = initialState, action) => {
    switch(action.type)
    {
        case "UPDATE_SIGNUP_MAIL":
            return { ...state, signup: { ...state.signup, email: action.payload.email }}
        default: 
            return state;
    }
};

export default Reducer;