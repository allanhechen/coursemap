import dynamic from "next/dynamic";
import React from "react";

const NoSSR = (props: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    children: any;
}) => <React.Fragment>{props.children}</React.Fragment>;

export default dynamic(() => Promise.resolve(NoSSR), {
    ssr: false,
});
