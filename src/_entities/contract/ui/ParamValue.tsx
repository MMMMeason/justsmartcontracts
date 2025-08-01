import { BooleanValue } from "@shared/ui/BooleanValue";
import { TAbiParamType, TAbiParam } from "../model/types";
import { AddressValue } from "@shared/ui/AddressValue";
import { TAddress } from "@shared/lib/web3";
import { Card, Typography } from "antd";
import { AbiParameter } from "abitype";
import { JsonViewer } from "@textea/json-viewer";

const { Text } = Typography;

type TProps = {
  abiType: TAbiParamType;
  value: unknown;
  abiParam?: TAbiParam; // 添加完整的 ABI 参数信息用于 tuple 解析
};

// 递归组件用于解析 tuple 类型
const TupleValue = ({
  value,
  abiParam,
}: {
  value: unknown;
  abiParam: AbiParameter;
}) => {
  // 检查是否是 tuple 类型且有 components
  if (
    abiParam.type !== "tuple" ||
    !("components" in abiParam) ||
    !abiParam.components ||
    !Array.isArray(value)
  ) {
    return (
      <JsonViewer
        value={value}
        editable={false}
        theme="light"
        style={{
          backgroundColor: "transparent",
          fontSize: "12px",
        }}
        defaultInspectDepth={2}
        displayDataTypes={false}
        enableClipboard={true}
      />
    );
  }

  // 将 tuple 数据转换为带字段名的对象
  const convertTupleToObject = (
    tupleValue: unknown[],
    components: readonly AbiParameter[]
  ) => {
    const result: Record<string, unknown> = {};
    components.forEach((component, index) => {
      const fieldName = component.name || `field${index}`;
      result[fieldName] = tupleValue[index];
    });
    return result;
  };

  const jsonData = convertTupleToObject(
    value as unknown[],
    abiParam.components
  );
  console.log(jsonData);

  return (
    <Card size="small" style={{ marginTop: 8 }}>
      <JsonViewer
        value={jsonData}
        editable={true}
        theme="light"
        style={{
          backgroundColor: "transparent",
          fontSize: "12px",
        }}
        defaultInspectDepth={2}
        displayDataTypes={false}
        enableClipboard={true}
      />
    </Card>
  );
};

export const ParamValue = ({ abiType, value, abiParam }: TProps) => {
  if (abiType === "bool") {
    return <BooleanValue value={String(value)} />;
  }

  if (abiType === "address") {
    return <AddressValue value={value as TAddress} />;
  }

  if (abiType === "uint256" || abiType.startsWith("uint")) {
    return <Text>{String(value)}</Text>;
  }

  if (abiType === "int256" || abiType.startsWith("int")) {
    return <Text>{String(value)}</Text>;
  }

  if (abiType === "string") {
    return <Text>{String(value)}</Text>;
  }

  if (abiType === "bytes" || abiType.startsWith("bytes")) {
    return <Text style={{ wordBreak: "break-all" }}>{String(value)}</Text>;
  }

  if (abiType === "tuple") {
    if (abiParam) {
      return <TupleValue value={value} abiParam={abiParam} />;
    }
    return <Text code>{String(value)}</Text>;
  }

  // 处理数组类型
  if (abiType.endsWith("[]")) {
    if (Array.isArray(value)) {
      return (
        <Card size="small" style={{ marginTop: 8 }}>
          <JsonViewer
            value={value}
            theme="light"
            style={{
              backgroundColor: "transparent",
              fontSize: "12px",
            }}
            defaultInspectDepth={2}
            displayDataTypes={true}
            enableClipboard={true}
          />
        </Card>
      );
    }
    return <Text code>{String(value)}</Text>;
  }

  return <Text>{String(value)}</Text>;
};
