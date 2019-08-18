import React from 'react';
import KeywordsCount from '../charts/keywordsCount';

class KeywordPage extends React.Component {
    public render() {
        return (
            <div className='keyword-page'>
              <KeywordsCount />
            </div>
          );
    }
}

export default KeywordPage;
