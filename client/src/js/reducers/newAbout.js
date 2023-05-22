const newAboutReducer = (state = '', action) => {
	switch (action.type) {
		case 'UPDATE_NEW_ABOUT':
			return action.value
		default:
			return state
	}
}

export default newAboutReducer