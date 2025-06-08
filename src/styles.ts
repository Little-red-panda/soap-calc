import styled from "styled-components";

export default {
    Container: styled.div`
        max-width: 800px;
        margin: 10px auto;
        padding: 10px;
        font-family: 'Arial, sans-serif';
    `,
    HeaderContainer: styled.div`
        background-color: #f5f5f5;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 20px;
    `,
    HeaderInputsWrap: styled.div`
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 10px;
    `,
    OilContainer: styled.div`
        padding: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    `,
}