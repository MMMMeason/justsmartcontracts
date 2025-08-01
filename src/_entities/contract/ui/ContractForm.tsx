import {
  Button,
  Form,
  Input,
  Upload,
  message,
  Card,
  Space,
  Typography,
} from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { ChainSelect, chainModel } from "@entities/chain";
import { TContractWithoutId } from "../model/types";
import { useState } from "react";

const { TextArea } = Input;
const { Title, Text } = Typography;

type TProps = {
  onSubmit: (_values: TContractWithoutId) => void;
  buttonText: string;
  value?: TContractWithoutId;
};

type TAbiFile = {
  name: string;
  content: string;
  abi: any[];
};

type TAddressMapping = {
  [key: string]: string;
};

// @ts-ignore
const CustomChainInput = ({
  value,
  onChange,
}: {
  value?: any;
  onChange?: any;
}) =>
  value && onChange ? <ChainSelect value={value} onChange={onChange} /> : null;

export const ContractForm = ({ buttonText, value, onSubmit }: TProps) => {
  const { chain } = chainModel.useCurrentChain();
  const [abiFiles, setAbiFiles] = useState<TAbiFile[]>([]);
  const [addressMapping, setAddressMapping] = useState<string>("");
  const [isBatchMode, setIsBatchMode] = useState(false);

  const initialValue = value || { chain, abi: [] };

  const textFormValues = {
    ...initialValue,
    abi: JSON.stringify(initialValue.abi, null, 2),
  };

  const submitHandler = (formValues: any) => {
    if (isBatchMode && abiFiles.length > 0) {
      // 批量模式：处理多个 ABI 文件
      try {
        const mapping: TAddressMapping = JSON.parse(addressMapping);

        abiFiles.forEach((file) => {
          const address = mapping[file.name];
          if (address && address.startsWith("0x")) {
            onSubmit({
              chain: formValues.chain,
              address: address as `0x${string}`,
              name: file.name,
              abi: file.abi,
            });
          }
        });

        message.success(`成功添加 ${abiFiles.length} 个合约`);
        setAbiFiles([]);
        setAddressMapping("");
      } catch (error) {
        message.error("地址映射 JSON 格式错误");
      }
    } else {
      // 单合约模式
      onSubmit({
        ...formValues,
        abi: JSON.parse(formValues.abi),
      });
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let abi: any[] = [];

        // 尝试解析 ABI
        if (content.includes("export const") && content.includes("ABI")) {
          // 处理 TypeScript 格式的 ABI 文件
          const match = content.match(
            /export const \w+ABI = (\[[\s\S]*?\]) as const;/
          );
          if (match) {
            abi = JSON.parse(match[1]);
          }
        } else {
          // 尝试直接解析 JSON
          abi = JSON.parse(content);
        }

        if (Array.isArray(abi)) {
          const newFile: TAbiFile = {
            name: file.name.replace(/\.(ts|js|json)$/, ""),
            content,
            abi,
          };
          setAbiFiles((prev) => [...prev, newFile]);
          message.success(`成功解析 ABI 文件: ${file.name}`);
        } else {
          message.error(`无效的 ABI 格式: ${file.name}`);
        }
      } catch (error) {
        message.error(`解析文件失败: ${file.name}`);
      }
    };
    reader.readAsText(file);
    return false; // 阻止默认上传行为
  };

  const removeAbiFile = (index: number) => {
    setAbiFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadProps = {
    beforeUpload: (file: File) => {
      handleFileUpload(file);
      return false; // 阻止默认上传行为
    },
    showUploadList: false,
    accept: ".ts,.js,.json",
    multiple: true,
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button
          type={isBatchMode ? "primary" : "default"}
          onClick={() => setIsBatchMode(!isBatchMode)}
        >
          {isBatchMode ? "单合约模式" : "批量模式"}
        </Button>
      </Space>

      <Form
        preserve={false}
        initialValues={textFormValues}
        layout="vertical"
        name="add-contract"
        onFinish={submitHandler}
      >
        <Form.Item label="Chain" name="chain">
          <CustomChainInput />
        </Form.Item>

        {isBatchMode ? (
          // 批量模式
          <>
            <Card title="上传 ABI 文件" size="small">
              <Upload.Dragger {...uploadProps}>
                <div style={{ padding: "20px", textAlign: "center" }}>
                  <UploadOutlined
                    style={{
                      fontSize: "24px",
                      color: "#1890ff",
                      marginBottom: "8px",
                    }}
                  />
                  <div>点击或拖拽文件到此区域上传</div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#999",
                      marginTop: "4px",
                    }}
                  >
                    支持 .ts, .js, .json 格式，可多选
                  </div>
                </div>
              </Upload.Dragger>

              {abiFiles.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <Text strong>已上传的 ABI 文件:</Text>
                  {abiFiles.map((file, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px",
                        border: "1px solid #d9d9d9",
                        borderRadius: "4px",
                        marginTop: "8px",
                      }}
                    >
                      <Text>{file.name}</Text>
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={() => removeAbiFile(index)}
                        danger
                      />
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Form.Item
              label="地址映射 (JSON 格式)"
              name="addressMapping"
              rules={[{ required: true, message: "请输入地址映射" }]}
            >
              <TextArea
                rows={8}
                placeholder={`{
  "TokenHelper": "0x74C3Ce17250bC522d2BFBFC3d19E1234D7df7205",
  "MarketManager": "0x6577e77967fC5A97565d35c7d53Ecb0966d3DFCf",
  "ListingManager": "0xB0ab721324A531e771Ef777cF28B56876B51eA43"
}`}
                value={addressMapping}
                onChange={(e) => setAddressMapping(e.target.value)}
              />
            </Form.Item>
          </>
        ) : (
          // 单合约模式
          <>
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: "Contract name missing" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Address"
              name="address"
              rules={[{ required: true, message: "Contract address missing" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="ABI"
              name="abi"
              rules={[{ required: true, message: "Contract ABI missing" }]}
            >
              <TextArea rows={10} />
            </Form.Item>
          </>
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit">
            {buttonText}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
