import React from 'react';
import { Pad, ListContent } from 'react-pannable';
import SvgCart from './SvgCart';
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
          tags: ['New'],
          number: 0,
        },
        {
          id: 'cappucino',
          name: 'Cappucino',
          price: '$3',
          tips:
            'Buy one get one free; Discount meal with a cup of cappucino and a piece of cupcake costs $4.5',
          tags: ['Hot', 'Discount'],
          number: 0,
        },
        {
          id: 'coffeeshake',
          name: 'Coffee Shake',
          price: '$3.2',
          tips: null,
          tags: ['Hot'],
          number: 0,
        },
        {
          id: 'frozenfrappe',
          name: 'Frozen Frappe',
          price: '$4',
          tips: 'Second half price',
          tags: null,
          number: 0,
        },
        {
          id: 'latte',
          name: 'Latte',
          price: '$3',
          tips: null,
          tags: ['Hot'],
          number: 0,
        },
        {
          id: 'matchalatte',
          name: 'Matcha Latte',
          price: '$3',
          tips: null,
          tags: ['Hot'],
          number: 0,
        },
        {
          id: 'cocktail',
          name: 'Cocktail',
          price: '$5.5',
          tips: null,
          tags: null,
          number: 0,
        },
        {
          id: 'icedtea',
          name: 'Iced Tea',
          price: '$2.8',
          tips: null,
          tags: null,
          number: 0,
        },
        {
          id: 'water',
          name: 'Water',
          price: '$1.5',
          tips: null,
          tags: null,
          number: 0,
        },
        {
          id: 'biscuit',
          name: 'Biscuit',
          price: '$2',
          tips: null,
          tags: null,
          number: 0,
        },
        {
          id: 'cinnamonroll',
          name: 'Cinnamon Roll',
          price: '$2.8',
          tips: null,
          tags: null,
          number: 0,
        },
        {
          id: 'chocolate',
          name: 'Chocolate',
          price: '$3',
          tips: null,
          tags: null,
          number: 0,
        },
        {
          id: 'croissant',
          name: 'Croissant',
          price: '$2.8',
          tips: null,
          tags: null,
          number: 0,
        },
        {
          id: 'cupcake',
          name: 'Cupcake',
          price: '$3',
          tips: null,
          tags: null,
          number: 0,
        },
        {
          id: 'donut',
          name: 'Donut',
          price: '$3',
          tips: null,
          tags: null,
          number: 0,
        },
        {
          id: 'sugar',
          name: 'Sugar',
          price: '$1',
          tips: null,
          tags: null,
          number: 0,
        },
        {
          id: 'coffeepack',
          name: 'Coffee Pack',
          price: '$10',
          tips: null,
          tags: null,
          number: 0,
        },
        {
          id: 'coffeecapsules',
          name: 'Coffee Capsules',
          price: '$2',
          tips: null,
          tags: null,
          number: 0,
        },
        {
          id: 'spices',
          name: 'Spices',
          price: '$2',
          tips: null,
          tags: null,
          number: 0,
        },
      ],
    };

    this.padRef = React.createRef();
    this.listRef = React.createRef();
  }

  handleAddCart = index => {
    this.setState(state => {
      const list = [...state.list];
      list[index].number += 1;

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
              const { id, name, price, tags, tips, number } = list[itemIndex];
              const hashFlag = number > 0 ? 1 : 0;

              return (
                <Item hash={id + hashFlag}>
                  <div className="productitem">
                    <div className="productitem-main">
                      <div
                        className={'productitem-poster ' + 'productitem-' + id}
                      />
                      <div className="productitem-right">
                        <div className="productitem-title">{name}</div>
                        <div className="productitem-price">{price}</div>
                        <SvgCart
                          className="productitem-cart"
                          onClick={() => {
                            this.handleAddCart(itemIndex);
                          }}
                        />
                      </div>
                    </div>
                    {tips && <div className="productitem-tips">{tips}</div>}
                    {tags && (
                      <div className="productitem-tagsbar">
                        {tags.map((tag, index) => (
                          <div className="productitem-tag" key={index}>
                            {tag}
                          </div>
                        ))}
                      </div>
                    )}
                    {number > 0 && (
                      <div className="productitem-carttips">
                        You've chosen {number}
                      </div>
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
