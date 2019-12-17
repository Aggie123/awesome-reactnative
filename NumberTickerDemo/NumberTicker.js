import React, { Component } from "react";
import { StyleSheet, Text, View, Animated } from "react-native";
import PropTypes from "prop-types";
import now from "performance-now";

const styles = StyleSheet.create({
    // 数字水平浮动排列
    row: {
        flexDirection: "row",
        overflow: "hidden",
    },

    // 隐藏
    hide: {
        position: "absolute",
        left: 0,
        right: 0,
        opacity: 0,
    },
});

// 指定范围创建数组
const range = length => Array.from({ length }, (x, i) => i);


/**
 * getPosition这个方法是用来计算目标数字的y轴坐标值，
 * 根据当前数字在数组中的下标乘以测量出的数字文本绘制高度取负值，得出坐标值。
 * @param {*} param0 
 */
const getPosition = ({ text, items, height }) => {
    // 获得文本在数组的下标
    return parseInt(text) * height * -1;
};

// 切割
const splitText = (text = "") => (text + "").split("");

// 是十进制数字判断
const isNumber = (text = "") => !isNaN(parseInt(text));
const isString = (text = "") => typeof text === "string";

// 创建"0","1","2","3","4"..."9"的数组,默认绘制数据
const resourceData = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

const getAnimationStyle = animation => {
    return {
        transform: [
            {
                translateY: animation,
            },
        ],
    };
};

/**
 *
 * @param children 子组件(文本内容)
 * @param style 样式
 * @param height 高度
 * @param textStyle 文本样式
 * @returns 无动画绘制文本
 * @constructor
 */
const Piece = ({ children, style, height, textStyle }) => {
    return (
        <View style={style}>
            <Text style={[textStyle, { height }]}>{children}</Text>
        </View>
    );
};


class Ticker extends Component {

    // 定义属性类型
    static propTypes = {
        tickerNum: PropTypes.number,
        height: PropTypes.number,
        text: PropTypes.string,
        textStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object, PropTypes.array]),
    };

    static defaultProps = {
        // 默认滚动时间
        rotateTime: 3000,
        tickerNum: 3,
        height: 20
    };

    state = {
        // 是否已测量
        // measured: false,
        // 高度
        // height: 0,
        // 获取props中的字体大小
        fontSize: this.props.textStyle.fontSize,
    };

    // props变动时回调
    componentWillReceiveProps(nextProps) {
        this.setState({
            fontSize: this.props.textStyle.fontSize,
        });
    }


    // handleMeasure = e => {

    //     //测量高度
    //     const height = e.nativeEvent.layout.height;
    //     this.setState(state => {
    //         if (state.measured) {
    //             return null;
    //         }
    //         return {
    //             measured: true,
    //             height,
    //         };
    //     });
    // };

    render() {

        // 获取文本内容,子组件,样式,滚动时长
        const { height, text, children, textStyle, style, rotateTime, tickerNum } = this.props;

        // 文本内容获取,读取text或子组件内容,两种方式配置文本内容
        const childs = text || children;

        // 如果子组件是字符串,字符串渲染,否则子组件渲染
        const renderer = isString(childs) ? stringNumberRenderer : generalChildRenderer;

        //绘制了一个隐藏的text组件，是为了测量在当前样式下，绘制出的数字高度值
        return (
            <View style={[styles.row, { height }, style]}>


                {renderer({
                    height,
                    tickerNum,
                    children: childs,
                    textStyle,
                    rotateTime,
                    rotateItems: resourceData,
                })}


            </View>
        );
    }
}

const generalChildRenderer = ({ height, tickerNum, children, textStyle, rotateTime, rotateItems = [] }) => {
    return React.Children.map(children, (child, i) => {
        if (isString(child)) {
            return (
                <Piece style={{ height }} height={height} textStyle={textStyle}>
                    {child}
                </Piece>
            );
        }

        const items = child.props.rotateItems || rotateItems;
        const key = items.join(",") + i;

        return React.cloneElement(child, {
            key,
            text: child.props.text || child.props.children,
            height,
            duration: child.props.rotateTime || rotateTime,
            textStyle,
            rotateItems: child.props.rotateItems || rotateItems,
        });
    });
};

//我们需要对当前的文本做切割得到包含文本中每个字符的字符数组，
//遍历切割后的字符数组，取出每一个字符，判断是否是数字，不是数字就直接绘制文本，
//Piece是封装的直接用text进行文本绘制的组件，如果是数字就绘制数字动画组件，
//Tick是封装的单个数字动画绘制的组件。
const stringNumberRenderer = ({ height, tickerNum, children, textStyle, rotateTime, rotateItems }) => {

    //传入的数字总长度
    let length = children.length;
    const rollLength = [4, 5, 6];

    // 切割子组件文本内容遍历
    return splitText(children).map((piece, i) => {

        //取单个字符，如果不是数字,直接绘制文本
        if (!isNumber(piece))
            return (
                <Piece key={i} style={{ height }} textStyle={textStyle}>
                    {piece}
                </Piece>
            );

        //前面数字不滚动，直接显示，在交界点显示一个“，”号，然后只滚动后面的tickerNum位数数字
        if (length > tickerNum) {
            //前面数字不滚动，直接显示
            if (i < length - tickerNum) {
                return (
                    <Piece key={i} style={{ height }} textStyle={textStyle}>
                        {piece}
                    </Piece>
                );
            } else {
                return (
                    <Tick
                        rollNum={rollLength[i - (length - tickerNum)]}
                        duration={rotateTime}
                        key={i}
                        text={piece}
                        textStyle={textStyle}
                        height={height}
                        rotateItems={rotateItems}
                    />
                );
            }
        } else {

            // 不足三位数字滚动的逻辑
            return (
                <Tick
                    rollNum={rollLength[tickerNum - length + i]}
                    duration={rotateTime}
                    key={i}
                    text={piece}
                    textStyle={textStyle}
                    height={height}
                    rotateItems={rotateItems}
                />
            );
        }


    });
};

class Tick extends Component {

    /**
     * 创建动画初始值
     * @type {{animation: Animated.Value}}
     */
    state = {
        animation: new Animated.Value(
            getPosition({
                text: "" + parseInt(this.props.text) + 10 - this.props.rollNum,
                items: this.props.rotateItems,
                height: this.props.height,
            })
        ),
    };
    componentDidMount() {
        let nowValue = parseInt(this.props.text);
        let now = nowValue + 10 - this.props.rollNum;

        let init = getPosition({
            text: "" + now,
            items: this.props.rotateItems,
            height: this.props.height,
        });

        this.setState({
            animation: new Animated.Value(
                init
            ),
        });
    }

    componentWillReceiveProps(nextProps) {

        let nowValue = parseInt(nextProps.text);
        let now = nowValue + 10 - nextProps.rollNum;
        let init = getPosition({
            text: "" + now,
            items: this.props.rotateItems,
            height: this.props.height,
        });

        console.log("componentWillReceiveProps-> init:" + init + " nextProps.text: " + nextProps.text + " nextProps.rollNum: " + nextProps.rollNum);
        this.setState({
            animation: new Animated.Value(
                init
            ),
        });
    }

    componentDidUpdate(prevProps) {
        const { height, duration, rotateItems, text } = this.props;
        //第一次进来，不执行动画
        var endValue = getPosition({
            text: "" + (parseInt(this.props.text) + 10),
            items: rotateItems,
            height,
        });
        // 数字变化,用当前动画值和变化后的动画值进行插值,并启动动画
        Animated.timing(this.state.animation, {
            toValue: endValue,
            duration,
            useNativeDriver: true,
        }).start();
    }

    render() {
        const { animation } = this.state;
        const { textStyle, height, rotateItems } = this.props;
        return (
            <View style={{ height }}>
                <Animated.View style={getAnimationStyle(animation)}>
                    {/*遍历数字范围数组绘制数字*/}
                    {rotateItems.map(v => (
                        <Text key={v} style={[textStyle, { height }]}>
                            {v}
                        </Text>

                    ))}
                </Animated.View>
            </View>
        );
    }
}

export { Tick, resourceData as numberRange };
export default Ticker;