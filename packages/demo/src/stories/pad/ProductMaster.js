import React from 'react';
import { Pad, ListContent } from 'react-pannable';
import './ProductMaster.css';

export default class ProductMaster extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      spacing: 10,
      list: [
        {
          id: 'affogato',
          name: 'Affogato',
          price: '$5',
          tips: null,
          tipsFolded: true,
        },
        {
          id: 'cappucino',
          name: 'Cappucino',
          price: '$3',
          tips:
            'Buy one get one free; Discount meal with a cup of cappucino and a piece of cupcake costs $4.5',
          tipsFolded: true,
        },
        {
          id: 'coffeeshake',
          name: 'Coffee Shake',
          price: '$3.2',
          tips: null,
          tipsFolded: true,
        },
        {
          id: 'frozenfrappe',
          name: 'Frozen Frappe',
          price: '$4',
          tips: 'Second half price',
          tipsFolded: true,
        },
        {
          id: 'latte',
          name: 'Latte',
          price: '$3',
          tips: null,
          tipsFolded: true,
        },
        {
          id: 'matchalatte',
          name: 'Matcha Latte',
          price: '$3',
          tips: null,
          tipsFolded: true,
        },
        {
          id: 'cocktail',
          name: 'Cocktail',
          price: '$5.5',
          tips: null,
          tipsFolded: true,
        },
        {
          id: 'icedtea',
          name: 'Iced Tea',
          price: '$2.8',
          tips: null,
          tipsFolded: true,
        },
        {
          id: 'water',
          name: 'Water',
          price: '$1.5',
          tips: null,
          tipsFolded: true,
        },
        {
          id: 'biscuit',
          name: 'Biscuit',
          price: '$2',
          tips: null,
          tipsFolded: true,
        },
        {
          id: 'cinnamonroll',
          name: 'Cinnamon Roll',
          price: '$2.8',
          tips: null,
          tipsFolded: true,
        },
        {
          id: 'chocolate',
          name: 'Chocolate',
          price: '$3',
          tips: null,
          tipsFolded: true,
        },
        {
          id: 'croissant',
          name: 'Croissant',
          price: '$2.8',
          tips: null,
          tipsFolded: true,
        },
        {
          id: 'cupcake',
          name: 'Cupcake',
          price: '$3',
          tips: null,
          tipsFolded: true,
        },
        {
          id: 'donut',
          name: 'Donut',
          price: '$3',
          tips: null,
          tipsFolded: true,
        },
        {
          id: 'sugar',
          name: 'Sugar',
          price: '$1',
          tips: null,
          tipsFolded: true,
        },
        {
          id: 'coffeepack',
          name: 'Coffee Pack',
          price: '$10',
          tips: null,
          tipsFolded: true,
        },
        {
          id: 'coffeecapsules',
          name: 'Coffee Capsules',
          price: '$2',
          tips: null,
          tipsFolded: true,
        },
        {
          id: 'spices',
          name: 'Spices',
          price: '$2',
          tips: null,
          tipsFolded: true,
        },
      ],
    };

    this.padRef = React.createRef();
    this.listRef = React.createRef();
  }

  handleTriggerTips = index => {
    this.setState(state => {
      const list = [...state.list];
      list[index].tipsFolded = !list[index].tipsFolded;

      return { list };
    });
  };

  render() {
    const { list } = this.state;

    return (
      <div className="main">
        <Pad
          ref={this.padRef}
          className="pad"
          directionalLockEnabled
          width={320}
          height={700}
          alwaysBounceX={false}
        >
          <ListContent
            ref={this.listRef}
            width={320}
            spacing={10}
            itemCount={list.length}
            renderItem={({ itemIndex, Item }) => {
              const { id, name, price, tips, tipsFolded } = list[itemIndex];
              const tipsTriggerText =
                tips && tipsFolded
                  ? 'Click to show tips'
                  : 'Click to hide tips';
              let hash = tips ? 'Item1' : 'Item2';
              hash = tipsFolded ? hash : tips;

              return (
                <Item hash={hash}>
                  <div className="productitem">
                    <div className="productitem-main">
                      <div
                        className={'productitem-poster ' + 'productitem-' + id}
                      />
                      <div className="productitem-right">
                        <div className="productitem-title">{name}</div>
                        <div className="productitem-price">{price}</div>
                      </div>
                    </div>
                    {tips && (
                      <div
                        className="productitem-trigger"
                        onClick={() => this.handleTriggerTips(itemIndex)}
                      >
                        {tipsTriggerText}
                      </div>
                    )}
                    {!tipsFolded && (
                      <div className="productitem-tips">{tips}</div>
                    )}
                  </div>
                </Item>
              );
            }}
          />
        </Pad>
      </div>
    );
  }
}
