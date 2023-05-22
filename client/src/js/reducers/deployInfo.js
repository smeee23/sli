const deployInfoReducer = (state = '', action) => {
	switch (action.type) {
		case 'DEPLOY_INFO':
			return action.value
		default:
			return state
	}
}

export default deployInfoReducer