const mobileReducer = (state = (window.innerWidth <= 800), action) => {
	switch (action.type) {
		case 'DETECT_MOBILE':
			return (window.innerWidth <= 800)
		default:
			return state
	}
}

export default mobileReducer