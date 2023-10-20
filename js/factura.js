let productos = [];
const url = "api/productos.json";
var total = 0;
var productosCarrito = [];
function mostrarToast() {
  var miToast = document.getElementById("miToast");
  var cartel = new bootstrap.Toast(miToast);
  cartel.show();
}

document.addEventListener("DOMContentLoaded", () => {
  mostrarToast();
});

// similar a  función getJSONData.
let obtener = (url) => {
  var resultado = {};
  return fetch(url)
    .then((respuesta) => {
      if (respuesta.ok) {
        return respuesta.json();
      } else {
        throw Error(respuesta.statusText);
      }
    })
    .then((respuesta) => {
      resultado.status = "ok";
      resultado.data = respuesta;

      return resultado;
    })
    .catch((error) => {
      resultado.status = "error";
      resultado.data = error;

      return resultado;
    });
};

function eliminar(Id) {
  let fila = document.getElementById(Id);
  const tabla = document.getElementById("tabla");
  const tdTotal = document.getElementById("total")
  if (fila) {

    const productoSeleccionado = productosCarrito.find((p) => p.id === Id);
    if (productoSeleccionado.cantidad === 1) {
      total -= productoSeleccionado.precio;
      tdTotal.innerHTML = `$${Math.round(total)}`;
      fila.parentNode.removeChild(fila);
    } else {
      productoSeleccionado.cantidad -= 1;
      productoSeleccionado.total -= productoSeleccionado.precio;
      productoSeleccionado.total = Math.round(productoSeleccionado.total)
      tabla.innerHTML="";
      total -= productoSeleccionado.precio;
      tdTotal.innerHTML = `$${Math.round(total)}`;
      for (let i = 0; i < productosCarrito.length; i++) {
        const producto = productosCarrito[i].nombre
        const precioTotal = productosCarrito[i].total
        const cantidad = productosCarrito[i].cantidad
        const id = productosCarrito[i].id
        tabla.innerHTML += `
          <tr id="${id}">
                <td>${producto}</td>
                <td>${cantidad}</td>
                <td class="precio">$${precioTotal}</td>
                <td id="${id}"><button onclick="eliminar(${id})" >X</button></td>
            </tr>
          `;
      }
    }
  }





}

function imprimirTicket() {
  const terminos = document.getElementById("terminos")
  const nombres = document.getElementById("nombres").value
  const tarjeta = document.getElementById("tarjeta").value
  const vencimiento = document.getElementById("vencimiento").value
  const cv = document.getElementById("cv").value
  console.log(nombres + " y " + tarjeta + " y " + vencimiento + " y " + cv)
  if (!terminos.checked || nombres === "" || tarjeta === "" || vencimiento === "" || cv === "") {
    if (!terminos.checked) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Debe aceptar los terminos y condiciones para proceder con el pago',
        footer: '<a href="">Why do I have this issue?</a>'
      })
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Complete todos los campos',
        footer: '<a href="">Why do I have this issue?</a>'
      })
    }
  } else {
    let doc = new jsPDF();

    doc.setFontSize(20);
    doc.text(80, 20, 'Ferretería "267"');
    doc.line(10, 25, 200, 25);
    doc.setFontSize(14);
    let ejeY = 30
    for (let i = 0; i < productosCarrito.length; i++) {
      const producto = productosCarrito[i].nombre
      const precioTotal = productosCarrito[i].total
      const cantidad = productosCarrito[i].cantidad
      const id = productosCarrito[i].id
      doc.text(10, ejeY, `${producto} - Precio (X${cantidad}): $${precioTotal}`);
      ejeY += 10;
    }
    doc.setFontSize(20);
    doc.line(10, 20 + productosCarrito.length * 10 + 1, 200, 20 + productosCarrito.length * 10 + 1);
    doc.setFontSize(16);
    doc.text(10, 20 + productosCarrito.length * 10 + 10, `Precio total: $${Math.round(total)}`);
    const cliente = document.getElementById("nombres").value;
    doc.save(cliente + ".pdf");
  }

}

document.addEventListener("DOMContentLoaded", () => {
  obtener(url).then((resultado) => {
    //Agrego los productos a la lista
    if (resultado.status === "ok") {
      productos = resultado.data;
      //cargarProductos(productos); funcion que carga productos en la lista disponible
      console.log(productos);
    }
    const select = document.getElementById("productos");
    for (let i = 0; i < productos.length; i++) {
      const producto = productos[i];
      select.innerHTML += `
        <option>${producto.producto} - $${producto.precio}</option>
      `;
    }
    const btAgregar = document.getElementById("btAgregar");
    btAgregar.addEventListener("click", () => {
      const option = select.value;
      const tabla = document.getElementById("tabla");
      const productoSeleccionado = productos.find((p) => option.includes(p.producto) && option.includes("$" + p.precio));

      const objProd = {
        id: productoSeleccionado.id,
        cantidad: 1,
        nombre: productoSeleccionado.producto,
        precio: productoSeleccionado.precio,
        total: productoSeleccionado.precio
      }
      const existe = productosCarrito.some(producto =>
        producto.id === productoSeleccionado.id
      );

      if (!existe) {
        productosCarrito.push(objProd)
      } else {
        const productoEncontrado = productosCarrito.find(producto => producto.id === productoSeleccionado.id);
        productoEncontrado.cantidad += 1;
        productoEncontrado.total += productoEncontrado.precio;
        productoEncontrado.total = Math.round(productoEncontrado.total)
      }

      tabla.innerHTML = ""
      for (let i = 0; i < productosCarrito.length; i++) {
        const producto = productosCarrito[i].nombre
        const precioTotal = productosCarrito[i].total
        const cantidad = productosCarrito[i].cantidad
        const id = productosCarrito[i].id
        tabla.innerHTML += `
          <tr id="${id}">
                <td>${producto}</td>
                <td>${cantidad}</td>
                <td class="precio">$${precioTotal}</td>
                <td id="${id}"><button onclick="eliminar(${id})" >X</button></td>
            </tr>
          `;
      }
      total += productoSeleccionado.precio;
      const tdTotal = document.getElementById("total")
      tdTotal.innerHTML = `$${Math.round(total)}`;
    })

    let btnImprimir = document.getElementById("imp");
    btnImprimir.addEventListener("click", () => {
      Swal.fire(
        'Good job!',
        'Muhcas gracias por comprar con nosotros, a contiuacion se dercargara un recibo a modo de comprobante. muchas gracias',
        'success'
      )
      imprimirTicket();
    });
  });
});
