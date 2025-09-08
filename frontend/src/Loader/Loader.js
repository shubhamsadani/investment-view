import styled from "styled-components";

export const Loader = styled.div`
    border: 4px solid #f3f3f3;
    border-top: 4px solid #09757a;
    border-radius: 50%;
    width: 80px;
    height: 80px;
    animation: spin 1s linear infinite;
    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
`;