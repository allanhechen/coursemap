import { useDisclosure } from "@mantine/hooks";
import { Modal, Button, Text } from "@mantine/core";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";

export default function DeleteModal() {
    const router = useRouter();
    const [opened, { open, close }] = useDisclosure(false);

    const handleDeletion = useCallback(async () => {
        try {
            await fetch("/api/user", {
                method: "DELETE",
            });
            router.push("/");
        } catch {
            notifications.show({
                withCloseButton: true,
                autoClose: false,
                title: "Account deletion failed",
                message: "Could not delete account, please try again",
                color: "red",
                className: "mt-2 transition-transform",
            });
        }
    }, [router]);

    return (
        <>
            <Modal opened={opened} onClose={close} title="Authentication">
                <Text className="my-5">
                    Are you sure you want to delete your account? This action
                    cannot be undone!
                </Text>
                <Button
                    variant="filled"
                    color="red"
                    onClick={handleDeletion}
                    className="w-full"
                >
                    I am sure
                </Button>
            </Modal>

            <Button variant="filled" color="red" onClick={open}>
                Delete Account{" "}
            </Button>
        </>
    );
}
