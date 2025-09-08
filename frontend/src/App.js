import { useCallback, useContext, useEffect } from 'react';
import { Route, Routes } from 'react-router';
import './App.css';
import InvestorsList from './InvestorsList/InvestorsList';
import Commitments from './Commitments/Commitments';
import { InvestorsDataContext } from './context/InvestorsDataContext';

const URL = process.env.REACT_APP_API_URL;

const App = () => {
    const { setInvestorsData } = useContext(InvestorsDataContext);
    const getData = useCallback(async () => {
        try {
          console.log("Inside");
            const response = await fetch(URL + 'investors');
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const json = await response.json();
            setInvestorsData(json);
        } catch (error) {
            console.error(error.message);
        }
    }, [setInvestorsData]);

    useEffect(() => {
        getData()
    }, [getData]);

    return (
        <div className='App'>
        <Routes>
            <Route path="/" element={<InvestorsList />} />
            <Route path="/:investorId" element={<Commitments />} />
        </Routes>
        </div>
    );
}

export default App;
