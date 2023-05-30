const depositorValIdsReducer = (state = [], action) => {
	switch (action.type) {
		case 'UPDATE_DEPOSITOR_VAL_IDS':
			return action.value
		default:
			return state
	}
}

export default depositorValIdsReducer