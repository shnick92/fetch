import React, { useState, useEffect } from 'react'
import './App.css'
import axios from 'axios'
import _ from 'lodash'

const App: React.FC = () => {
	const [finalDataArray, setFinalDataArray] = useState<
		{ name: string; listId: number; id: number }[][]
	>()
	const [finalDataArrayLoaded, setFinalDataArrayLoaded] = useState(false)

	useEffect(() => {
		const fetchSortData = async () => {
			// this is just to get around any potential localhost CORS issues
			const proxyURL = 'https://cors-anywhere.herokuapp.com/'
			const fetchURL = 'https://fetch-hiring.s3.amazonaws.com/hiring.json'
			const response = await axios.get(proxyURL + fetchURL)

			// used native Array.filter() method to filter out objects that had a name
			// that wasn't blank or null
			const filteredData = response.data.filter(
				(object: { name: string; listId: number; id: number }) =>
					object.name !== '' && object.name !== null
			)

			// used the lodash .sortBy() method to handle the heavy lifting of the sorting;
			// had to make a callback for the name sorting because it was sorting lexicographically
			// (ie Item 0, Item 1, Item 10, Item 11, Item 100, etc.) which is not what we wanted
			// so I made the assumption that the data was going to be the same format each time
			// and parsed out the number from the name and made that an integer so the sorting
			//happens numerically.
			const sortedData = _.sortBy(filteredData, [
				'listId',
				(obj) => {
					const nameId = obj.name.split(' ')
					return parseInt(nameId[1])
				},
			])

			// used the lodash .groupBy() and .map() methods to group the sortedData by listId
			// and then flatten it into an array of 4 separate arrays - one for each group/listId - of
			// items; following this, set the state and set loaded to true so that the data displays in
			// the final tables
			const groupedData = _.groupBy(sortedData, 'listId')
			const flattenedData = _.map(groupedData)
			setFinalDataArray(flattenedData)
			setFinalDataArrayLoaded(true)
		}
		fetchSortData()
	}, [])

	return (
		<>
			<div className='App'>
				{finalDataArrayLoaded ? (
					finalDataArray!.map((group, groupIndex) => {
						return (
							<>
								<div className='tableDiv'>
									<h1 className='groupHeading'>ListId Group {groupIndex + 1}</h1>
									<table key={groupIndex}>
										<thead>
											<tr>
												<th>ID</th>
												<th>Name</th>
												<th>ListId</th>
											</tr>
										</thead>
										<tbody>
											{group.map((item, index) => {
												const { name, listId, id } = item
												return (
													<>
														<tr key={index}>
															<td data-column='ID'>{id}</td>
															<td data-column='Name'>{name}</td>
															<td data-column='ListId'>{listId}</td>
														</tr>
													</>
												)
											})}
										</tbody>
									</table>
								</div>
							</>
						)
					})
				) : (
					<h1>I am loading...</h1>
				)}
			</div>
		</>
	)
}

export default App
