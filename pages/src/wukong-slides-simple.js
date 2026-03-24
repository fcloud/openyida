import { Component } from 'react';

export default class WukongSlidesSimple extends Component {
  render() {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <iframe
          src="https://your-domain.com/pages/dist/wukong-slides-frontend.html"
          style={{
            width: '100%',
            height: '100%',
            border: 'none'
          }}
          frameborder="0"
        />
      </div>
    );
  }
}
