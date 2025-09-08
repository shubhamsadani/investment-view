import { useContext } from 'react';
import styled from 'styled-components';
import { InvestorsDataContext } from '../context/InvestorsDataContext';
import { useNavigate } from 'react-router';
import { Loader } from '../Loader/Loader';

const columnNames = ['ID', 'Name', 'Type', 'Date Added', 'Country', 'Total Commitments'];

const InvestorsList = () => {
    const navigate = useNavigate();
    const { investorsData } = useContext(InvestorsDataContext);
    
    const formatter = new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 2,
    });

    if (!investorsData) {
        return (
            <LoaderWrapper>
                <Loader data-testid="loader" />
            </LoaderWrapper>
        );
    }


    return (
        <InvestorsListContainer>
            <Header>Investors</Header>
            <Table>
                <TableRow isHeading>{columnNames.map(item => <TableHeading>{item}</TableHeading>)}</TableRow>
                {
                    investorsData.map(investor => (
                        <TableRow onClick={() => navigate(`/${investor.id}`)}>
                        <TableDetails>{investor.id}</TableDetails>
                        <TableDetails>{investor.name}</TableDetails>
                        <TableDetails>{investor.type}</TableDetails>
                        <TableDetails>{new Date(investor.date_added).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</TableDetails>
                        <TableDetails>{investor.country}</TableDetails>
                        <TableDetails>{formatter.format(investor.commitments)}</TableDetails>
                        </TableRow>
                    ))
                }
            </Table>
        </InvestorsListContainer>    
    );
};

export default InvestorsList;

const InvestorsListContainer = styled.div`
    display: flex;
    max-width: 1200px;
    width: 100%;
    height: 100%;
    flex-direction: column;
    font-family: 'Fira Sans';
`;

const LoaderWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
`;

const Header = styled.div`
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 2rem;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
`;
        
const TableRow = styled.tr`
    &:hover{
        background-color: ${({ isHeading }) => isHeading ? 'none' : '#EDF5FF'};    
        cursor: ${({ isHeading }) => isHeading ? 'default' : 'pointer'};
    }
`;

const TableHeading = styled.th`
    font-weight: 600;
    text-align: center;
    padding: 8px;
    border-bottom: 1px solid #DDD;
`;
    
const TableDetails = styled.td`
    font-weight: 400;
    text-align: center;
    padding: 8px;
    border-bottom: 1px solid #DDD;
`;