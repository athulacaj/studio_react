import DigitalAlbum from "./components/DigitalAlbum"

const dummyData = [
    {
        "url": "https://img.smartslides.com/gal/aws/2k/2x/117017/e142d5eb311dae369c9affe61c6b8d/ccbb30aad906c821efa1.jpg?width=291&height=878&sharp_amount=65&sharp_radius=1",
        "id": "0"
    },
    {
        "url": "https://img.smartslides.com/gal/aws/2k/2x/117017/d3febef9815cecd08d86c089812342/30ea5ca249c0eec27eaa.jpg?width=291&height=878&sharp_amount=65&sharp_radius=1",
        "id": "1"
    },
    {
        "url": "https://img.smartslides.com/gal/aws/2k/2x/117017/062cbe5a077629faf3cbb05943044b/674c0538479dc1e62cf9.jpg?width=291&height=878&sharp_amount=65&sharp_radius=1",
        "id": "2"
    },
    {
        "url": "https://img.smartslides.com/gal/aws/2k/2x/117017/5c41ff18f6a325cffb24fd046aa89a/3421dee51dadff35a643.jpg?width=291&height=878&sharp_amount=65&sharp_radius=1",
        "id": "3"
    },
    {
        "url": "https://img.smartslides.com/gal/aws/2k/2x/117017/e0f7227f82344bdd01904d98f2cc7f/a4a6fcac6c7ed386ccb7.jpg?width=291&height=878&sharp_amount=65&sharp_radius=1",
        "id": "4"
    },
    {
        "url": "https://img.smartslides.com/gal/aws/2k/2x/117017/7d59274d4a85c4795bc778d3fc6c92/6fd7e794620d7208cbaa.jpg?width=291&height=878&sharp_amount=65&sharp_radius=1",
        "id": "5"
    },
    {
        "url": "https://img.smartslides.com/gal/aws/2k/2x/117017/9002c35f419a32c0a3b4511ddf2b0a/c8c9acbd4a1a4996dc49.jpg?width=291&height=878&sharp_amount=65&sharp_radius=1",
        "id": "6"
    },
    {
        "url": "https://img.smartslides.com/gal/aws/2k/2x/117017/622c25606c14a1e3c04b38cdb498cf/ed5e36226bb15fc90d55.jpg?width=291&height=878&sharp_amount=65&sharp_radius=1",
        "id": "7"
    },
    {
        "url": "https://img.smartslides.com/gal/aws/2k/2x/117017/e71139d1e2aa142559979583e12953/259df3064ddf050ff80e.jpg?width=291&height=878&sharp_amount=65&sharp_radius=1",
        "id": "8"
    },
    {
        "url": "https://img.smartslides.com/gal/aws/2k/2x/117017/1a4c967685d76d7fdda365a61e9189/9a1e93d9c3728410a6c0.jpg?width=291&height=878&sharp_amount=65&sharp_radius=1",
        "id": "9"
    },
    {
        "url": "https://img.smartslides.com/gal/aws/2k/2x/117017/62b5ff0c25cecf945c76ea5fb11d4d/471e52c5453814fa575b.jpg?width=291&height=878&sharp_amount=65&sharp_radius=1",
        "id": "10"
    },
    {
        "url": "https://img.smartslides.com/gal/aws/2k/2x/117017/32c0648b21d24e8e17044de9079300/2c813424269fcdd8e0b9.jpg?width=291&height=878&sharp_amount=65&sharp_radius=1",
        "id": "11"
    },
    {
        "url": "https://img.smartslides.com/gal/aws/2k/2x/117017/bc77c77f6505aa79f3ac94399f9601/b13943d7d4168c975277.jpg?width=291&height=878&sharp_amount=65&sharp_radius=1",
        "id": "12"
    },
    {
        "url": "https://img.smartslides.com/gal/aws/2k/2x/117017/7e9f49e1b737451d5862716d12f545/2c1341983f20944a9a7b.jpg?width=291&height=878&sharp_amount=65&sharp_radius=1",
        "id": "13"
    },
    {
        "url": "https://img.smartslides.com/gal/aws/2k/2x/117017/ac065d3ef69ddf903b4c3cf056dc09/34a487e7c997f0b2626f.jpg?width=291&height=878&sharp_amount=65&sharp_radius=1",
        "id": "14"
    },
    {
        "url": "https://img.smartslides.com/gal/aws/2k/2x/117017/df9464ee44b71b0198d8b21fd9a4e6/28e78f4d91f2ea9c24ea.jpg?width=291&height=878&sharp_amount=65&sharp_radius=1",
        "id": "15"
    }
]

export default function Dummy() {
    return (
        <DigitalAlbum
            images={dummyData}
            layout={[{ i: '1', x: 0, y: 0, w: 4, h: 3 }]}
            onSave={(layouts) => console.log(layouts)
            }
        />

    )
}